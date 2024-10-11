import { Document } from './document';

export interface DocumentCardProps {
  document: Document;
  index: number;
  moveCard: (fromIndex: number, toIndex: number) => void;
}
