import type { LucideIcon } from "lucide-react";

export type NodeCategory = "Trigger" | "Action" | "Logic" | "Output";

export type NodeInput = {
    name: string;
    type: string;
    label?: string;
    widget?: 'string' | 'number' | 'boolean' | 'textarea';
    placeholder?: string;
};

export type NodeOutput = {
    name: string;
    type: string;
    label?: string;
};

export type NodeSpec = {
  type: string;
  label: string;
  category: NodeCategory;
  icon: LucideIcon;
  description: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  width?: number;
};

export type Node = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data?: any;
};

export type Edge = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};

export type VerificationStatus = "draft" | "verifying" | "verified" | "failed";

export type Workflow = {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  verificationStatus?: VerificationStatus;
};

export type GalleryItem = {
  id: string;
  title: string;
  author: string;
  rating: number;
  downloads: number;
  imageUrl: string;
  imageHint: string;
  tags: string[];
  isNsfw: boolean;
  verificationStatus: VerificationStatus;
};
