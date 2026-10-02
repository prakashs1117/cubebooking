export interface CardItem {
  id: string;
  image: string;
  category: string;
  categoryColor: string;
  title: string;
  subtitle?: string;
}

export interface InsightItem {
  id: string;
  image: string;
  category: string;
  categoryColor: string;
  title: string;
  meta: string;
}

export interface CardSectionData {
  title: string;
  seeAllLabel?: string;
  items: CardItem[];
}

export interface InsightSectionData {
  title: string;
  items: InsightItem[];
}
