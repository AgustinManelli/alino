import { v4 as uuidv4 } from "uuid";
import { LexoRank } from "lexorank";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { getAIGateway } from "../gateway/aiGateway";
import {
  HierarchicalPlanningOutput,
  HierarchicalPlanningOutputSchema,
  TaskPlanningInput,
} from "../schemas/taskPlanning";
import { buildTemporalContext, wrapUserPromptSafely } from "../promptContext";
import {
  AI_FEATURE_KEY,
  calculateDynamicCredits,
  AI_DEFAULT_CREDIT_COSTS,
} from "../creditCosts";
import { TokenUsage } from "../gateway/types";
import { FolderType, ListsType, TaskType } from "@/lib/schemas/database.types";

const HIERARCHICAL_SYSTEM_PROMPT = `Eres un arquitecto de productividad y planificación de proyectos de élite.
Tu objetivo es analizar la solicitud del usuario y diseñar una estructura de trabajo jerárquica impecable (Carpetas, Listas y Tareas ordenadas).

Directivas de Arquitectura y Agrupación:
1. "folders": Úsalo cuando el usuario plantee proyectos amplios, múltiples materias o diferentes ámbitos de su vida que merezcan agruparse (ej. "Exámenes Facultad", "Mudanza Hogar", "Lanzamiento Startup").
   - Cada carpeta agrupa 1 o más listas temáticas relacionadas.
   - "folderName": Nombre conciso y claro (máx 30 caracteres).
   - "color": Elige un color hexadecimal representativo de la paleta.
2. "standaloneLists": Úsalo para listas independientes que van en la raíz sin necesidad de una carpeta contenedora.
   - Si el usuario pide un solo tema simple (ej: "Rutina de gimnasio"), crea 1 sola lista aquí y deja "folders" vacío [].
3. Listas ("lists"):
   - "listName": Título específico y claro (máx 30 caracteres).
   - "color": Elige un color de la paleta coherente con el tema.
   - "icon": Asigna SIEMPRE un emoji representativo en formato estricto de shortcode (ej: :books:, :laptop:, :mortar_board:, :calendar:, :memo:, :flight_departure:, :house:, :shopping_cart:, :muscle:, :hammer_and_wrench:, :briefcase:, :chart_with_upwards_trend:, :sparkles:, :rocket:, :art:, :stethoscope:, :credit_card:, :car:, etc.).
   - "tasks": Array de entre 1 y hasta 35 tareas ordenadas en estricto orden lógico o cronológico de ejecución.
     - "text": Descripción concisa, directa y accionable en español (máx 250 caracteres).
     - "type": "check" para tareas a completar o "note" para recordatorios o material clave.
     - "target_date": Distribuye fechas y horas lógicas ISO 8601 UTC comenzando desde hoy hasta la fecha límite. Si no hay fecha aplicable, usa null.

Paleta de Colores recomendada:
- Estudio / Academia: #87189d (morado), #0693e3 (azul cielo), #0000ff (azul)
- Trabajo / Negocios: #ff6900 (naranja), #ffae00 (ámbar), #ffdd00 (amarillo)
- Salud / Bienestar: #00ffbf (menta), #7ed321 (verde), #00ff00 (verde brillante)
- Hogar / Trámites: #2ccce4 (turquesa), #f54275 (rosa), #ff0048 (rojo carmesí)`;

export interface TaskPlanningResult {
  folders: FolderType[];
  lists: ListsType[];
  tasks: TaskType[];
  list: ListsType;
  credits: {
    used: number;
    limit: number;
    remaining: number;
  } | null;
  tokenUsage?: TokenUsage;
  metadata: {
    providerUsed: string;
    modelUsed: string;
    fallbackOccurred: boolean;
    durationMs: number;
  };
}

function normalizeShortcode(icon?: string | null): string | null {
  if (!icon) return null;
  const trimmed = icon.trim();
  if (trimmed.startsWith(":") && trimmed.endsWith(":")) {
    return trimmed.toLowerCase();
  }

  const unicodeMap: Record<string, string> = {
    "📚": ":books:",
    "💻": ":laptop:",
    "🎓": ":mortar_board:",
    "📝": ":memo:",
    "📅": ":calendar:",
    "🏠": ":house:",
    "✈️": ":flight_departure:",
    "🛒": ":shopping_cart:",
    "💪": ":muscle:",
    "🚀": ":rocket:",
    "🎨": ":art:",
    "✨": ":sparkles:",
    "💼": ":briefcase:",
    "🚗": ":car:",
    "🔧": ":hammer_and_wrench:",
  };
  return unicodeMap[trimmed] || (trimmed ? `:${trimmed.replace(/[^a-z0-9_]/gi, "")}:` : null);
}

export class TaskPlanningService {
  async planAndExecute(
    input: TaskPlanningInput,
    user: User,
    supabase: SupabaseClient
  ): Promise<TaskPlanningResult> {
    const gateway = getAIGateway();

    const temporalContext = buildTemporalContext();
    const systemPrompt = `${HIERARCHICAL_SYSTEM_PROMPT}\n\n${temporalContext}`;
    const userPrompt = wrapUserPromptSafely(
      input.prompt,
      `Solicitud de planificación. Límite de tareas por lista: ${input.maxTasks ?? 35}`
    );

    const gatewayResult = await gateway.generateStructured<HierarchicalPlanningOutput>({
      systemPrompt,
      userPrompt,
      schema: HierarchicalPlanningOutputSchema,
      schemaName: "HierarchicalPlanningResponse",
      temperature: 0.2,
    });

    const aiPlan = gatewayResult.data;

    let folderRankCursor = LexoRank.middle();
    let listRankCursor = LexoRank.middle();

    const preparedFolders = (aiPlan.folders || []).map((f, fIdx) => {
      folderRankCursor = folderRankCursor.genNext();
      const folderId = uuidv4();

      const listsInFolder = (f.lists || []).map((l, lIdx) => {
        listRankCursor = listRankCursor.genNext();
        const listId = uuidv4();
        let taskRankCursor = LexoRank.middle();

        const tasksInList = (l.tasks || []).map((t, tIdx) => {
          taskRankCursor = taskRankCursor.genNext();
          return {
            task_id: uuidv4(),
            task_content: `<p>${t.text}</p>`,
            target_date: t.target_date ?? null,
            completed: t.type === "note" ? null : false,
            rank: taskRankCursor.toString(),
            index: tIdx,
          };
        });

        return {
          list_id: listId,
          list_name: l.listName.slice(0, 30),
          color: l.color || "#87189d",
          icon: normalizeShortcode(l.icon),
          rank: listRankCursor.toString(),
          index: lIdx,
          tasks: tasksInList,
        };
      });

      return {
        folder_id: folderId,
        folder_name: f.folderName.slice(0, 30),
        folder_color: f.color || "#87189d",
        rank: folderRankCursor.toString(),
        index: fIdx,
        lists: listsInFolder,
      };
    });

    const preparedStandaloneLists = (aiPlan.standaloneLists || []).map((l, lIdx) => {
      listRankCursor = listRankCursor.genNext();
      const listId = uuidv4();
      let taskRankCursor = LexoRank.middle();

      const tasksInList = (l.tasks || []).map((t, tIdx) => {
        taskRankCursor = taskRankCursor.genNext();
        return {
          task_id: uuidv4(),
          task_content: `<p>${t.text}</p>`,
          target_date: t.target_date ?? null,
          completed: t.type === "note" ? null : false,
          rank: taskRankCursor.toString(),
          index: tIdx,
        };
      });

      return {
        list_id: listId,
        list_name: l.listName.slice(0, 30),
        color: l.color || input.color || "#87189d",
        icon: normalizeShortcode(l.icon || input.icon),
        rank: listRankCursor.toString(),
        index: lIdx,
        tasks: tasksInList,
      };
    });

    if (preparedFolders.length === 0 && preparedStandaloneLists.length === 0) {
      preparedStandaloneLists.push({
        list_id: uuidv4(),
        list_name: "Mis Tareas",
        color: "#87189d",
        icon: ":memo:",
        rank: LexoRank.middle().toString(),
        index: 0,
        tasks: [
          {
            task_id: uuidv4(),
            task_content: "<p>Comenzar planificación</p>",
            target_date: null,
            completed: false,
            rank: LexoRank.middle().genNext().toString(),
            index: 0,
          },
        ],
      });
    }

    const creditCost = calculateDynamicCredits(
      gatewayResult.usage,
      AI_DEFAULT_CREDIT_COSTS.generateTasks
    );

    const { data: atomicData, error: atomicError } = await supabase.rpc(
      "create_workspace_hierarchy_atomic",
      {
        p_folders: preparedFolders,
        p_standalone_lists: preparedStandaloneLists,
        p_cost: creditCost,
      }
    );

    const userProfile = {
      user_id: user.id,
      display_name: (user.user_metadata?.display_name as string) || "Usuario",
      username: (user.user_metadata?.username as string) || "usuario",
      avatar_url: (user.user_metadata?.avatar_url as string) || null,
      level: 1,
      equipped_frame_id: null,
      equipped_overlay_id: null,
    };

    if (!atomicError && atomicData) {
      const finalFolders: FolderType[] = (atomicData.folders || []).map((f: any) => ({
        folder_id: f.folder_id,
        folder_name: f.folder_name,
        folder_color: f.folder_color,
        folder_description: null,
        index: Number(f.index ?? 0),
        rank: f.rank,
        pinned: false,
        user_id: user.id,
        created_at: f.created_at || new Date().toISOString(),
        updated_at: null,
        memberships: f.memberships || [{ count: 0 }],
      }));

      const finalLists: ListsType[] = (atomicData.lists || []).map((l: any) => ({
        list_id: l.list_id,
        user_id: user.id,
        role: "owner",
        pinned: false,
        index: Number(l.index ?? 0),
        rank: l.rank,
        folder: l.folder,
        shared_by: null,
        shared_since: l.shared_since || new Date().toISOString(),
        updated_at: null,
        list: l.list,
      }));

      const finalTasks: TaskType[] = (atomicData.tasks || []).map((t: any) => ({
        task_id: t.task_id,
        list_id: t.list_id,
        task_content: t.task_content,
        target_date: t.target_date,
        completed: t.completed,
        rank: t.rank,
        index: Number(t.index ?? 0),
        created_at: t.created_at,
        updated_at: t.updated_at,
        description: t.description || "",
        created_by: userProfile,
      }));

      return {
        folders: finalFolders,
        lists: finalLists,
        tasks: finalTasks,
        list: finalLists[0],
        credits: atomicData.credits,
        tokenUsage: gatewayResult.usage,
        metadata: {
          providerUsed: gatewayResult.metadata.providerUsed,
          modelUsed: gatewayResult.metadata.modelUsed,
          fallbackOccurred: gatewayResult.metadata.fallbackOccurred,
          durationMs: gatewayResult.metadata.totalDurationMs,
        },
      };
    }

    console.warn(
      "[TaskPlanningService] create_workspace_hierarchy_atomic no encontrado. Ejecutando contingencia en servidor:",
      atomicError?.message
    );

    const { data: creditResult, error: creditError } = await supabase.rpc(
      "consume_feature_limit",
      {
        p_feature_key: AI_FEATURE_KEY,
        p_cost: creditCost,
      }
    );

    if (creditError || !creditResult?.allowed) {
      throw new Error(
        creditResult?.reason === "feature_not_available"
          ? "Esta función de IA no está disponible en tu plan actual."
          : "Alcanzaste tu límite mensual de créditos IA."
      );
    }

    const now = new Date().toISOString();

    const foldersToInsert = preparedFolders.map((f) => ({
      folder_id: f.folder_id,
      user_id: user.id,
      folder_name: f.folder_name,
      folder_color: f.folder_color,
      index: f.index,
      rank: f.rank,
      pinned: false,
      created_at: now,
      updated_at: now,
    }));

    interface PreparedListWithFolder {
      list_id: string;
      list_name: string;
      color: string;
      icon: string | null;
      rank: string;
      index: number;
      folder_id: string | null;
      tasks: {
        task_id: string;
        task_content: string;
        target_date: string | null;
        completed: boolean | null;
        rank: string;
        index: number;
      }[];
    }

    const allPreparedLists: PreparedListWithFolder[] = [
      ...preparedFolders.flatMap((f) =>
        f.lists.map((l) => ({ ...l, folder_id: f.folder_id }))
      ),
      ...preparedStandaloneLists.map((l) => ({ ...l, folder_id: null })),
    ];

    const listsToInsert = allPreparedLists.map((l) => ({
      list_id: l.list_id,
      owner_id: user.id,
      list_name: l.list_name,
      color: l.color,
      icon: l.icon,
      created_at: now,
      updated_at: now,
    }));

    const membershipsToInsert = allPreparedLists.map((l) => ({
      list_id: l.list_id,
      user_id: user.id,
      rank: l.rank,
      role: "owner" as const,
      index: l.index,
      folder: l.folder_id,
      shared_since: now,
      updated_at: now,
    }));

    const tasksToInsert = allPreparedLists.flatMap((l) =>
      l.tasks.map((t) => ({
        task_id: t.task_id,
        list_id: l.list_id,
        task_content: t.task_content,
        target_date: t.target_date,
        completed: t.completed,
        rank: t.rank,
        index: t.index,
        created_by: user.id,
        created_at: now,
        updated_at: now,
      }))
    );

    if (foldersToInsert.length > 0) {
      const { error: foldersErr } = await supabase
        .from("list_folders")
        .insert(foldersToInsert);
      if (foldersErr) throw foldersErr;
    }

    if (listsToInsert.length > 0) {
      const { error: listsErr } = await supabase
        .from("lists")
        .insert(listsToInsert);
      if (listsErr) throw listsErr;
    }

    if (membershipsToInsert.length > 0) {
      const { error: memErr } = await supabase
        .from("list_memberships")
        .insert(membershipsToInsert);
      if (memErr) throw memErr;
    }

    if (tasksToInsert.length > 0) {
      const { error: tasksErr } = await supabase
        .from("tasks")
        .insert(tasksToInsert);
      if (tasksErr) throw tasksErr;
    }

    const fallbackCreatedFolders: FolderType[] = preparedFolders.map((f) => ({
      folder_id: f.folder_id,
      folder_name: f.folder_name,
      folder_color: f.folder_color,
      folder_description: null,
      index: f.index,
      rank: f.rank,
      pinned: false,
      user_id: user.id,
      created_at: now,
      updated_at: null,
      memberships: [{ count: f.lists.length }],
    }));

    const fallbackCreatedLists: ListsType[] = allPreparedLists.map((l) => ({
      list_id: l.list_id,
      user_id: user.id,
      role: "owner",
      pinned: false,
      index: l.index,
      rank: l.rank,
      folder: l.folder_id,
      shared_by: null,
      shared_since: now,
      updated_at: null,
      list: {
        list_id: l.list_id,
        list_name: l.list_name,
        color: l.color,
        icon: l.icon,
        owner_id: user.id,
        is_shared: false,
        non_owner_count: 0,
        created_at: now,
        updated_at: null,
        description: null,
        tasks: [{ count: l.tasks.length }],
      },
    }));

    const fallbackCreatedTasks: TaskType[] = tasksToInsert.map((t) => ({
      task_id: t.task_id,
      list_id: t.list_id,
      task_content: t.task_content,
      target_date: t.target_date,
      completed: t.completed,
      rank: t.rank,
      index: Number(t.index),
      created_at: now,
      updated_at: now,
      description: "",
      created_by: userProfile,
    }));

    return {
      folders: fallbackCreatedFolders,
      lists: fallbackCreatedLists,
      tasks: fallbackCreatedTasks,
      list: fallbackCreatedLists[0],
      credits: creditResult,
      tokenUsage: gatewayResult.usage,
      metadata: {
        providerUsed: gatewayResult.metadata.providerUsed,
        modelUsed: gatewayResult.metadata.modelUsed,
        fallbackOccurred: gatewayResult.metadata.fallbackOccurred,
        durationMs: gatewayResult.metadata.totalDurationMs,
      },
    };
  }
}
