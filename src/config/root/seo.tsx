export type SeoType = {
  title: string;
  subTitle: string;
  absoluteTitle: string;
  ogTitle: string;
  author: { name: string };
  description: string;
  keywords: Array<string>;
  tags: Array<string>;
};

export const seoData: SeoType = {
  title: "alino",
  subTitle: "all-in-one, all-in-order, alino",
  absoluteTitle: "alino",
  ogTitle: "alino",
  author: {
    name: "Agustin Manelli",
  },
  description: "Todo app list for students",
  keywords: [
    "todo, list, study, order, subjects, alino, tasks, allinone, school",
  ],
  tags: ["todo", "list", "school"],
};
