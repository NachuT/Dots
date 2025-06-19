// TEMPORARILY DISABLED: Project page is commented out for rework
// import { useState, useEffect } from "react";

const GRID_SIZE = 100;

type OutlinePixel = { x: number; y: number; color: string };
type ProgressPixel = { x: number; y: number; color: string };
type Project = {
  id: number;
  name: string;
  outline: OutlinePixel[];
  progress: ProgressPixel[];
  created_by: string;
  created_at: string;
};

export default function ProjectsPage() {
  // Page temporarily disabled for rework
  return null;
} 