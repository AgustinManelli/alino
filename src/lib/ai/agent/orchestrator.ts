import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { z } from "zod";
import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  AgentChatMessage,
  AgentExecutionResult,
  AgentToolContext,
  AgentToolDefinition,
  PendingConfirmationAction,
  UserProfileContext,
} from "./types";
import { ALL_AGENT_TOOLS, getToolByName } from "./tools";
import { deductAICredits } from "../credits";
import { v4 as uuidv4 } from "uuid";

function zodToGeminiSchema(schema: z.ZodType<any>): any {
  if (schema instanceof z.ZodDefault) return zodToGeminiSchema(schema._def.innerType);
  if (schema instanceof z.ZodOptional) return zodToGeminiSchema(schema._def.innerType);
  if (schema instanceof z.ZodNullable) return zodToGeminiSchema(schema._def.innerType);

  if (schema instanceof z.ZodString) {
    const res: any = { type: "STRING" };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodNumber) {
    const isInt = schema._def.checks?.some((c: any) => c.kind === "int");
    const res: any = { type: isInt ? "INTEGER" : "NUMBER" };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodBoolean) {
    const res: any = { type: "BOOLEAN" };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodEnum) {
    const res: any = { type: "STRING", enum: schema._def.values };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodArray) {
    const res: any = { type: "ARRAY", items: zodToGeminiSchema(schema._def.type) };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const key of Object.keys(shape)) {
      const field = shape[key];
      properties[key] = zodToGeminiSchema(field);
      if (
        !(field instanceof z.ZodOptional) &&
        !(field instanceof z.ZodDefault) &&
        !(field instanceof z.ZodNullable)
      ) {
        required.push(key);
      }
    }
    const res: any = { type: "OBJECT", properties };
    if (required.length > 0) res.required = required;
    if (schema.description) res.description = schema.description;
    return res;
  }
  return { type: "STRING" };
}

function zodToOpenAISchema(schema: z.ZodType<any>): any {
  if (schema instanceof z.ZodDefault) return zodToOpenAISchema(schema._def.innerType);
  if (schema instanceof z.ZodOptional) return zodToOpenAISchema(schema._def.innerType);
  if (schema instanceof z.ZodNullable) return zodToOpenAISchema(schema._def.innerType);

  if (schema instanceof z.ZodString) {
    const res: any = { type: "string" };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodNumber) {
    const isInt = schema._def.checks?.some((c: any) => c.kind === "int");
    const res: any = { type: isInt ? "integer" : "number" };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodBoolean) {
    const res: any = { type: "boolean" };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodEnum) {
    const res: any = { type: "string", enum: schema._def.values };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodArray) {
    const res: any = { type: "array", items: zodToOpenAISchema(schema._def.type) };
    if (schema.description) res.description = schema.description;
    return res;
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];
    for (const key of Object.keys(shape)) {
      const field = shape[key];
      properties[key] = zodToOpenAISchema(field);
      if (
        !(field instanceof z.ZodOptional) &&
        !(field instanceof z.ZodDefault) &&
        !(field instanceof z.ZodNullable)
      ) {
        required.push(key);
      }
    }
    const res: any = { type: "object", properties };
    if (required.length > 0) res.required = required;
    if (schema.description) res.description = schema.description;
    return res;
  }
  return { type: "string" };
}

function buildSystemPrompt(user: User, userTimezone?: string, userProfile?: UserProfileContext): string {
  const now = new Date();
  const tz = userProfile?.timezone || userTimezone || "UTC";
  const dateStr = now.toLocaleString("es-ES", { timeZone: tz, dateStyle: "full", timeStyle: "medium" });
  const isoDate = now.toISOString();

  const displayName = userProfile?.display_name || user.email?.split("@")[0] || "Usuario";
  const username = userProfile?.username || "usuario";
  const level = userProfile?.level ?? 1;
  const tier = userProfile?.tier ? userProfile.tier.toUpperCase() : "FREE";
  const subStatus = userProfile?.subscription_status === "active" ? "Activo" : (userProfile?.subscription_status ?? "Activo");
  const expirationText = userProfile?.period_end
    ? new Date(userProfile.period_end).toLocaleDateString("es-ES", { dateStyle: "long" })
    : "Plan Gratuito (sin fecha de vencimiento)";

  return `Eres el Asistente Virtual Inteligente de Alino, una plataforma moderna de productividad y gestión de tareas.
Tu objetivo es ayudar al usuario a controlar Alino mediante lenguaje natural de forma precisa, proactiva y amigable.

### Perfil e Identidad del Usuario:
- Nombre: ${displayName}
- Nombre de usuario: @${username}
- Nivel en Alino: Nivel ${level}
- Plan de Membresía: ${tier} (${subStatus})
- Vencimiento de Membresía: ${expirationText}
${userProfile?.biography ? `- Biografía: "${userProfile.biography}"` : ""}

### Personalización y Saludos:
- Conoces perfectamente al usuario. Dirígete a él de forma cercana y personalizada llamándolo por su nombre ("${displayName}").
- Cuando comience una nueva conversación o el usuario te salude, salúdalo cordialmente por su nombre (ej: "¡Hola ${displayName}! 👋 ¿en qué puedo ayudarte hoy?").
- Si el usuario te pregunta por sus datos de perfil, nombre, nombre de usuario (@${username}), nivel o el estado y vencimiento de su membresía, responde directamente con estos datos que ya tienes en contexto sin decir que no tienes acceso.

### Contexto temporal del usuario:
- Fecha y hora actual en la zona horaria del usuario (${tz}): ${dateStr}
- Timestamp ISO actual: ${isoDate}
- Interpreta expresiones temporales ("hoy", "mañana", "pasado mañana", "el lunes", "en 3 días") calculando la fecha correspondiente en base a este contexto temporal.

### Directrices de Comportamiento:
1. **Filosofía de Mínimo Contexto**: No asumas ni inventes tareas, listas ni estadísticas. Utiliza siempre las herramientas disponibles para consultar la información real en la base de datos antes de responder o realizar cambios.
2. **Jerarquía y Estructura de Datos de Alino**:
   - Carpetas (list_folders) -> contienen Listas (lists) -> contienen Tareas (tasks).
   - Las tareas pertenecen siempre a una lista. Las "tareas de una carpeta" son las tareas contenidas en las listas de esa carpeta.
   - Para inspeccionar qué hay en una carpeta, 'get_folders' te devuelve cada carpeta con todas sus listas y el conteo de tareas. También 'get_lists' devuelve todas las listas (tanto las que están dentro de carpetas como en la raíz).
   - Puedes buscar tareas dentro de una carpeta directamente con 'search_tasks' usando el parámetro 'folder_name' o 'folder_id'.
   - Si el usuario dice "saca de la carpeta X todas sus tareas/listas y elimínala":
     * Esto significa extraer las listas de la carpeta a la raíz (desvincularlas) para preservar intactas las listas y sus tareas, y eliminar la carpeta.
     * Puedes usar 'move_folder_lists_to_root' para moverlas a la raíz y luego 'delete_folder', o usar 'delete_folder' con 'delete_contents: false' (que preserva las listas y tareas moviéndolas a la raíz).
     * NUNCA digas que una carpeta está vacía sin haber consultado 'get_folders' o 'get_lists'.
3. **Soporte Multilingüe Total (i18n)**:
   - Alino es una aplicación global y multilingüe. El usuario puede comunicarse contigo en cualquier idioma: español, inglés, portugués, francés, alemán, italiano, etc.
   - Detecta automáticamente el idioma de cada mensaje y responde SIEMPRE con total fluidez, naturalidad y corrección gramatical en ese mismo idioma.
   - Si el usuario te habla en inglés, responde en inglés; si te habla en español, en español; si cambia de idioma, adáptate de inmediato.
   - La etiqueta <!--TITLE: ...--> generada en el primer mensaje debe estar escrita en el idioma en que el usuario te habló.
   - Las herramientas se llaman siempre con sus nombres técnicos de esquema ('create_task', 'get_lists', etc.), pero debes comunicar los resultados y respuestas al usuario con máxima empatía y amabilidad en su propio idioma.
4. **Resolución de Referencias y Ejecución Obligatoria de Modificaciones (PROHIBIDO fingir en texto)**:
   - Cuando el usuario te pida reprogramar, posponer, cambiar fecha u hora (ej: "reprogramame X para mañana a las 3", "cambiala para el viernes"), mover, completar, borrar o editar una tarea:
     * ¡DEBES INVOCAR OBLIGATORIAMENTE LA HERRAMIENTA 'update_task' (o 'move_task' / 'toggle_task_status') EN ESE MISMO TURNO!
     * ESTÁ TERMINANTEMENTE PROHIBIDO responder por texto diciendo "¡Listo!", "Reprogramé la tarea" o "Fecha actualizada" si NO ejecutaste la herramienta. Responder que lo hiciste sin invocar la herramienta es una ALUCINACIÓN GRAVE porque la base de datos no se modifica.
     * Para reprogramar una tarea: invoca 'update_task' pasando el nombre de la tarea en 'task_content' (o su 'task_id'), el nombre de la lista en 'list_name' (si se indicó), y la nueva fecha calculada en formato ISO en 'target_date'.
     * Si el usuario dice "Ponela mañana" o "Y agregala a la lista X", utiliza el contexto de los mensajes recientes y busca o actualiza la tarea de inmediato con las herramientas.
     * Si pide crear una tarea en una lista que aún no existe, crea la lista primero con 'create_list' y luego la tarea con 'create_task'.
5. **Claridad y Concisión**: Sé directo, agradable y conciso. Cuando realices una acción, confirma claramente qué se hizo (nombre de la tarea, lista, fecha, etc.). Si algo falla, explícalo con sinceridad.
6. **Formato**: Puedes utilizar markdown ligero (negritas, listas, emojis apropiados) para estructurar tus respuestas y hacerlas fáciles de leer.
7. **REGLA ESTRICTA DE CONFIRMACIONES (NO pedir confirmación por texto)**:
   - NUNCA escribas en tus mensajes de texto preguntas como "¿Confirmas que elimine?", "Responde 'Sí, eliminar todo' y procedo", "¿Estás seguro?", ni pidas escribir palabras de confirmación.
   - Nuestra aplicación cuenta con un sistema de seguridad nativo: cuando llamas a una herramienta destructiva, el sistema la intercepta automáticamente y le presenta al usuario una TARJETA INTERACTIVA con botones [Confirmar] y [Cancelar] en el chat.
   - Pedir confirmación por texto es un error grave porque obliga al usuario a escribir innecesariamente y luego tener que pulsar el botón de nuevo. LLAMA DIRECTAMENTE a la herramienta destructiva correspondiente.
8. **Eliminación masiva o borrado general ("elimina todo", "borra todas las tareas", "elimina las listas")**:
   - Si el usuario dice "elimina todo", "elimina todo (listas, tareas, carpetas)", "borra todo", "wipe" o "limpia todo mi espacio": invoca DIRECTAMENTE 'delete_workspace_data'.
   - Si el usuario dice "elimina las listas" o "borra todas las listas": invoca DIRECTAMENTE 'delete_all_lists'.
   - Si el usuario dice "elimina todas las tareas" o "borra todas mis tareas": invoca DIRECTAMENTE 'delete_all_tasks'.
   - NUNCA intentes llamar a 'delete_task' o 'delete_list' una por una cuando el usuario pide borrar en masa.
9. **Creación Masiva o Estructura Completa ('create_workspace_hierarchy')**:
   - Cuando el usuario te pida crear una estructura completa, organizar un espacio, armar un trimestre, o crear múltiples carpetas con sus listas y tareas (por ejemplo: "Creá 4 carpetas con sus listas y tareas...", "Estructura mi trimestre", "Arma mis proyectos"):
     * ¡UTILIZA SIEMPRE Y EN UN SOLO PASO LA HERRAMIENTA 'create_workspace_hierarchy'!
     * NUNCA crees carpetas una por una ('create_folder'), luego listas una por una ('create_list'), y luego tareas una por una ('create_task'). Hacerlo de forma individual agota los pasos de ejecución y puede dejar tareas sin crear.
     * En 'create_workspace_hierarchy' puedes pasar todas las carpetas en 'folders' con sus 'lists' (con 'icon' y 'color') y las 'tasks' de cada lista (con 'task_content', 'target_date' con horarios lógicos y 'description') de una sola vez.
     * También puedes pasar 'standalone_lists' para listas que no pertenezcan a ninguna carpeta.
     * Toda la estructura se creará de forma atómica y completa en un único paso.

### Directrices de Creación de Contenido (Colores, Emojis y Horarios):
1. **Colores Temáticos de Alino**:
   - Al crear Carpetas ('create_folder') o Listas ('create_list'), selecciona siempre un color temático vibrante de la paleta oficial de Alino:
     * '#87189d' (púrpura principal / Alino / proyectos)
     * '#0693e3' (azul cian / tecnología, universidad, estudio)
     * '#ff6900' (naranja vibrante / mudanza, hogar, creatividad)
     * '#7ed321' (verde manzana / salud, finanzas, bienestar)
     * '#ff0048' (frambuesa / urgente, personal, prioridades)
     * '#c800ff' (morado eléctrico / ideas, innovación)
     * '#2ccce4' (turquesa / viajes, ocio, trámites)
     * '#ffae00' (ámbar / compras, despensa)
     * '#00ffbf' (menta / relax, hábitos)
   - No dejes siempre el mismo color por defecto; asigna colores representativos para que visualmente el espacio quede bien diferenciado.

2. **Formato Estricto de Iconos y Emojis para Listas ('icon')**:
   - En Alino el campo 'icon' de las listas requiere OBLIGATORIAMENTE el formato de shortcode de emoji entre dos puntos (ej: ':rocket:', ':computer:', ':mortar_board:', ':books:', ':moneybag:', ':muscle:', ':house:', ':page_facing_up:', ':herb:'), o 'null' si la lista solo debe representarse con su color temático.
   - NUNCA envíes el emoji unicode crudo (ej: NO envíes '🚀', '💻' ni '🎓'; envía SIEMPRE ':rocket:', ':computer:', ':mortar_board:').
   - Ejemplos de shortcodes oficiales:
     * ':mortar_board:', ':computer:', ':books:' para Universidad, Sistemas, Programación, Estudio.
     * ':card_file_box:', ':floppy_disk:' para Base de Datos, Servidores.
     * ':package:', ':truck:' para Mudanza, Empaquetado, Envíos.
     * ':page_facing_up:', ':memo:' para Trámites, Contratos, Legal, Documentos.
     * ':shopping_trolley:' para Compras, Supermercado.
     * ':rocket:', ':bulb:', ':chart_with_upwards_trend:' para Startups, Growth, Marketing, Lanzamientos.
     * ':muscle:', ':weight_lifter:', ':person_running:' para Fitness, Gimnasio, Salud, Deportes.
     * ':moneybag:', ':credit_card:' para Finanzas, Inversionistas, Pagos.
     * ':house:', ':wrench:', ':hammer_and_wrench:' para Hogar, Mantenimiento.
     * ':herb:', ':seedling:', ':person_in_lotus_position:' para Hábitos, Bienestar, Mentalidad.
   - Si no estás seguro del shortcode exacto, deja 'icon' en null para que se use el color temático de la lista.

3. **Asignación de Horarios y Fechas Inteligentes ('target_date')**:
   - Tienes el contexto temporal del usuario: fecha actual, hora actual y su zona horaria (${tz}).
   - Cuando el usuario mencione plazos, fechas ("mañana", "el mes que viene", "este viernes", "para el final de la semana") o cuando sea pertinente programar las tareas creadas:
     * Asigna a 'target_date' una fecha y hora completa en formato ISO 8601 (ej. 'YYYY-MM-DDTHH:mm:ss.sssZ').
     * Asigna horarios lógicos y realistas en la zona horaria del usuario (${tz}) convertidos a UTC en el ISO string:
       - Tareas de mañana / trámites / gestiones: 09:00 o 10:00 hs locales
       - Tareas de estudio / trabajo de tarde: 14:00 o 16:00 hs locales
       - Plazo límite o entrega del día: 18:00 o 20:00 hs locales
     * Para expresiones relativas como "el mes que viene": toma la fecha actual de referencia (${dateStr}) y calcula fechas y horarios concretos y realistas en el mes entrante.

4. **Título de la conversación (Solo en tu primera respuesta)**:
   - Si estás respondiendo al primer mensaje de una nueva conversación, genera un título ultra conciso (de 3 a 5 palabras, sin comillas, sin emojis, sin punto final) que resuma con precisión el tema central del usuario.
   - Colócalo al final absoluto de tu mensaje en este formato exacto:
     <!--TITLE: Tu Título Conciso-->
   - Ejemplos:
     <!--TITLE: Organización de Mudanza y Finales-->
     <!--TITLE: Lanzamiento FitPulse Q4-->
     <!--TITLE: Tareas pendientes de hoy-->
   - Nuestra plataforma extraerá automáticamente esta etiqueta para asignarla como título del chat y la ocultará del usuario.`;
}

function buildConfirmationDescription(toolName: string, params: Record<string, unknown>): string {
  switch (toolName) {
    case "delete_workspace_data":
      return "¿Confirmas que deseas eliminar TODO (todas las carpetas, listas y tareas de tu cuenta)? Esta acción es permanente y no se podrá deshacer.";
    case "delete_all_lists":
      return "¿Confirmas que deseas eliminar TODAS tus listas y las tareas que contienen? Esta acción no se puede deshacer.";
    case "delete_all_tasks":
      if (params.list_name) {
        return `¿Confirmas que deseas eliminar TODAS las tareas de la lista "${params.list_name}"? Esta acción no se puede deshacer.`;
      }
      return "¿Confirmas que deseas eliminar TODAS las tareas de tu cuenta? Esta acción es permanente y no se podrá deshacer.";
    case "delete_task":
      return `¿Confirmas que deseas eliminar la tarea "${params.task_content || params.task_id || "seleccionada"}"? Esta acción no se puede deshacer.`;
    case "delete_list":
      return `¿Confirmas que deseas eliminar la lista "${params.list_name || params.list_id || "seleccionada"}" y todas sus tareas? Esta acción no se puede deshacer.`;
    case "delete_folder":
      if (params.delete_contents) {
        return `¿Confirmas que deseas eliminar la carpeta "${params.folder_name || params.folder_id || "seleccionada"}" y TODO su contenido (listas y tareas)? Esta acción no se puede deshacer.`;
      }
      return `¿Confirmas que deseas eliminar la carpeta "${params.folder_name || params.folder_id || "seleccionada"}"? (Sus listas y tareas se preservarán en la raíz).`;
    case "clear_completed_tasks":
      return "¿Confirmas que deseas vaciar y eliminar todas las tareas completadas? Esta acción no se puede deshacer.";
    default:
      return `¿Confirmas que deseas ejecutar la acción "${toolName}"? Esta acción no se puede deshacer.`;
  }
}

function extractConversationTitle(text: string): { cleanText: string; title?: string } {
  const match = text.match(
    /(?:<!--\s*(?:CONVERSATION_)?TITLE:\s*(.*?)\s*-->|\[(?:CONVERSATION_)?TITLE:\s*(.*?)\])/i
  );
  if (match) {
    const raw = (match[1] || match[2] || "")
      .replace(/^["'«“]|["'»”]$/g, "")
      .replace(/\.$/, "")
      .trim();
    const cleanText = text
      .replace(
        /(?:<!--\s*(?:CONVERSATION_)?TITLE:\s*.*?\s*-->|\[(?:CONVERSATION_)?TITLE:\s*.*?\])/gi,
        ""
      )
      .trim();
    if (raw.length > 0 && raw.length <= 60) {
      return { cleanText, title: raw };
    }
    return { cleanText };
  }
  return { cleanText: text };
}

export class AIAgentOrchestrator {
  private geminiClient: GoogleGenAI | null = null;
  private deepseekClient: OpenAI | null = null;

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: geminiKey });
    }

    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    if (deepseekKey) {
      this.deepseekClient = new OpenAI({
        apiKey: deepseekKey,
        baseURL: "https://api.deepseek.com/v1",
      });
    }
  }

  async run(options: {
    messages: AgentChatMessage[];
    context: AgentToolContext;
    userProfile?: UserProfileContext;
    userTimezone?: string;
    conversationId: string;
    confirmedAction?: { toolName: string; params: Record<string, unknown> };
  }): Promise<AgentExecutionResult> {
    const { messages, context, userProfile, userTimezone, conversationId, confirmedAction } = options;
    if (userProfile && !context.userProfile) {
      context.userProfile = userProfile;
    }
    const tools = ALL_AGENT_TOOLS;

    if (confirmedAction) {
      const tool = getToolByName(confirmedAction.toolName);
      if (tool) {
        const result = await tool.execute(confirmedAction.params, context);
        const confirmMsg = (result as any)?.message || `He completado la operación confirmada: ${tool.name}.`;
        return {
          message: confirmMsg,
          toolCallsExecuted: [
            {
              toolName: tool.name,
              params: confirmedAction.params,
              result,
            },
          ],
          creditsUsed: 1,
          conversationId,
        };
      }
    }

    let tokenUsageAccumulator = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    const executedToolsLog: { toolName: string; params: Record<string, unknown>; result: unknown }[] = [];
    let executionResult: AgentExecutionResult | null = null;

    if (this.deepseekClient) {
      try {
        executionResult = await this.runWithDeepSeek({
          messages,
          context,
          userTimezone,
          conversationId,
          tools,
          tokenUsageAccumulator,
          executedToolsLog,
        });
      } catch (deepseekError: unknown) {
        console.warn(
          "[AIAgentOrchestrator] DeepSeek falló, intentando fallback con Gemini:",
          deepseekError instanceof Error ? deepseekError.message : deepseekError
        );
      }
    }

    if (!executionResult && this.geminiClient) {
      try {
        executionResult = await this.runWithGemini({
          messages,
          context,
          userTimezone,
          conversationId,
          tools,
          tokenUsageAccumulator,
          executedToolsLog,
        });
      } catch (geminiError: unknown) {
        console.error(
          "[AIAgentOrchestrator] Gemini fallback también falló:",
          geminiError instanceof Error ? geminiError.message : geminiError
        );
      }
    }

    if (!executionResult) {
      throw new Error("No hay proveedores de IA disponibles o ambos proveedores fallaron. Verifica tus API keys.");
    }

    const { cleanText, title } = extractConversationTitle(executionResult.message);
    executionResult.message = cleanText;
    if (title) {
      executionResult.conversationTitle = title;
    }

    return executionResult;
  }

  private async runWithGemini(params: {
    messages: AgentChatMessage[];
    context: AgentToolContext;
    userTimezone?: string;
    conversationId: string;
    tools: AgentToolDefinition[];
    tokenUsageAccumulator: { promptTokens: number; completionTokens: number; totalTokens: number };
    executedToolsLog: { toolName: string; params: Record<string, unknown>; result: unknown }[];
  }): Promise<AgentExecutionResult> {
    const { messages, context, userTimezone, conversationId, tools, tokenUsageAccumulator, executedToolsLog } = params;
    if (!this.geminiClient) throw new Error("Gemini client not initialized");

    const systemInstruction = buildSystemPrompt(context.user, userTimezone, context.userProfile);

    const geminiToolDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: zodToGeminiSchema(t.parameters),
    }));

    const contents: any[] = [];
    for (const msg of messages) {
      if (!msg.content || !msg.content.trim()) continue;
      if (msg.role === "user") {
        contents.push({ role: "user", parts: [{ text: msg.content }] });
      } else if (msg.role === "assistant") {
        contents.push({ role: "model", parts: [{ text: msg.content }] });
      }
    }

    let maxSteps = 15;
    let finalAssistantText = "";
    let pendingConfirmation: PendingConfirmationAction | undefined = undefined;

    while (maxSteps > 0) {
      maxSteps--;

      const response = await this.geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: geminiToolDeclarations }],
          temperature: 0.2,
        },
      });

      if (response.usageMetadata) {
        tokenUsageAccumulator.promptTokens += response.usageMetadata.promptTokenCount ?? 0;
        tokenUsageAccumulator.completionTokens += response.usageMetadata.candidatesTokenCount ?? 0;
        tokenUsageAccumulator.totalTokens += response.usageMetadata.totalTokenCount ?? 0;
      }

      const functionCalls = response.functionCalls;

      if (!functionCalls || functionCalls.length === 0) {
        finalAssistantText = response.text || "";
        break;
      }

      const modelParts: any[] = [];
      const userResponseParts: any[] = [];

      for (const call of functionCalls) {
        const toolName = call.name || "";
        if (!toolName) continue;
        const toolArgs = (call.args || {}) as Record<string, unknown>;
        const tool = getToolByName(toolName);

        modelParts.push({ functionCall: { name: toolName, args: toolArgs } });

        if (!tool) {
          userResponseParts.push({
            functionResponse: {
              name: toolName,
              response: { error: `Tool "${toolName}" not found.` },
            },
          });
          continue;
        }

        if (tool.isDestructive) {
          pendingConfirmation = {
            id: uuidv4(),
            toolName: tool.name,
            params: toolArgs,
            description: buildConfirmationDescription(tool.name, toolArgs),
          };

          return {
            message: `Para tu seguridad, esta acción requiere confirmación:`,
            toolCallsExecuted: executedToolsLog,
            requiresConfirmation: pendingConfirmation,
            creditsUsed: 1,
            conversationId,
          };
        }

        try {
          const toolResult = await tool.execute(toolArgs, context);
          executedToolsLog.push({ toolName, params: toolArgs, result: toolResult });

          userResponseParts.push({
            functionResponse: {
              name: toolName,
              response: toolResult,
            },
          });
        } catch (err: any) {
          const errorMsg = err?.message || "Tool execution failed";
          executedToolsLog.push({ toolName, params: toolArgs, result: { error: errorMsg } });

          userResponseParts.push({
            functionResponse: {
              name: toolName,
              response: { error: errorMsg },
            },
          });
        }
      }

      contents.push({ role: "model", parts: modelParts });
      contents.push({ role: "user", parts: userResponseParts });
    }

    if (!finalAssistantText) {
      try {
        const finalResp = await this.geminiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });
        finalAssistantText = finalResp.text || "";
      } catch (err) {
        console.warn("[AIAgentOrchestrator] Failed to generate final synthesis for Gemini:", err);
      }
    }

    const deduction = await deductAICredits(
      context.supabase,
      tokenUsageAccumulator,
      1
    );
    const creditCost = deduction.creditCost;
    const remainingCredits = deduction.remainingCredits;

    return {
      message: finalAssistantText || "He procesado tu solicitud.",
      toolCallsExecuted: executedToolsLog,
      creditsUsed: creditCost,
      remainingCredits,
      conversationId,
    };
  }

  private async runWithDeepSeek(params: {
    messages: AgentChatMessage[];
    context: AgentToolContext;
    userTimezone?: string;
    conversationId: string;
    tools: AgentToolDefinition[];
    tokenUsageAccumulator: { promptTokens: number; completionTokens: number; totalTokens: number };
    executedToolsLog: { toolName: string; params: Record<string, unknown>; result: unknown }[];
  }): Promise<AgentExecutionResult> {
    const { messages, context, userTimezone, conversationId, tools, tokenUsageAccumulator, executedToolsLog } = params;
    if (!this.deepseekClient) throw new Error("DeepSeek client not initialized");

    const systemPrompt = buildSystemPrompt(context.user, userTimezone, context.userProfile);

    const openAITools = tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: zodToOpenAISchema(t.parameters),
      },
    }));

    const openAIMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((m) => Boolean(m.content && m.content.trim()))
        .map((m) => ({
          role: (m.role === "tool" ? "assistant" : m.role) as "user" | "assistant" | "system",
          content: m.content,
        })),
    ];

    let maxSteps = 15;
    let finalAssistantText = "";

    while (maxSteps > 0) {
      maxSteps--;

      const completion = await this.deepseekClient.chat.completions.create({
        model: "deepseek-chat",
        messages: openAIMessages,
        tools: openAITools,
        temperature: 0.2,
      });

      if (completion.usage) {
        tokenUsageAccumulator.promptTokens += completion.usage.prompt_tokens ?? 0;
        tokenUsageAccumulator.completionTokens += completion.usage.completion_tokens ?? 0;
        tokenUsageAccumulator.totalTokens += completion.usage.total_tokens ?? 0;
      }

      const choice = completion.choices[0];
      if (!choice) break;

      const assistantMsg = choice.message;
      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        finalAssistantText = assistantMsg.content || "";
        break;
      }

      openAIMessages.push(assistantMsg);

      for (const call of assistantMsg.tool_calls) {
        if (!("function" in call) || !call.function) continue;
        const toolName = call.function.name;
        let toolArgs: Record<string, unknown> = {};
        try {
          toolArgs = JSON.parse(call.function.arguments);
        } catch {
          toolArgs = {};
        }

        const tool = getToolByName(toolName);
        if (!tool) {
          openAIMessages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ error: `Tool ${toolName} not found` }),
          });
          continue;
        }

        if (tool.isDestructive) {
          return {
            message: `Para tu seguridad, esta acción requiere confirmación:`,
            toolCallsExecuted: executedToolsLog,
            requiresConfirmation: {
              id: uuidv4(),
              toolName: tool.name,
              params: toolArgs,
              description: buildConfirmationDescription(tool.name, toolArgs),
            },
            creditsUsed: 1,
            conversationId,
          };
        }

        try {
          const result = await tool.execute(toolArgs, context);
          executedToolsLog.push({ toolName, params: toolArgs, result });
          openAIMessages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result),
          });
        } catch (err: any) {
          const errorMsg = err?.message || "Tool execution failed";
          executedToolsLog.push({ toolName, params: toolArgs, result: { error: errorMsg } });
          openAIMessages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ error: errorMsg }),
          });
        }
      }
    }

    if (!finalAssistantText) {
      try {
        const finalCompletion = await this.deepseekClient.chat.completions.create({
          model: "deepseek-chat",
          messages: openAIMessages,
          temperature: 0.3,
        });
        finalAssistantText = finalCompletion.choices[0]?.message?.content || "";
      } catch (err) {
        console.warn("[AIAgentOrchestrator] Failed to generate final synthesis for DeepSeek:", err);
      }
    }

    const deduction = await deductAICredits(
      context.supabase,
      tokenUsageAccumulator,
      1
    );
    const creditCost = deduction.creditCost;
    const remainingCredits = deduction.remainingCredits;

    return {
      message: finalAssistantText || "He procesado tu solicitud.",
      toolCallsExecuted: executedToolsLog,
      creditsUsed: creditCost,
      remainingCredits,
      conversationId,
    };
  }
}

let orchestratorInstance: AIAgentOrchestrator | null = null;
export function getAIAgentOrchestrator(): AIAgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AIAgentOrchestrator();
  }
  return orchestratorInstance;
}
