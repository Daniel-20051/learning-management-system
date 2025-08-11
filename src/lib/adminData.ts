import type { Course } from "@/types/admin";

export const dummyCourses: Course[] = [
  {
    id: "1",
    title: "Introduction to React",
    description: "Learn the fundamentals of React development",
    category: "Programming",
    status: "published",
    enrolledStudents: 45,
    createdAt: "2024-01-15",
    modules: [
      {
        id: "m1",
        title: "Getting Started with React",
        description: "Basic concepts and setup",
        order: 1,
        units: [
          {
            id: "u1",
            title: "What is React?",
            type: "video",
            duration: "15 min",
            order: 1,
          },
          {
            id: "u2",
            title: "Setting up your development environment",
            type: "text",
            order: 2,
          },
          {
            id: "u3",
            title: "Your first React component",
            type: "video",
            duration: "20 min",
            order: 3,
          },
        ],
      },
      {
        id: "m2",
        title: "Components and Props",
        description: "Building reusable components",
        order: 2,
        units: [
          {
            id: "u4",
            title: "Functional Components",
            type: "video",
            duration: "18 min",
            order: 1,
          },
          {
            id: "u5",
            title: "Props and State",
            type: "video",
            duration: "25 min",
            order: 2,
          },
          {
            id: "u6",
            title: "Component Quiz",
            type: "quiz",
            order: 3,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts",
    category: "Programming",
    status: "draft",
    enrolledStudents: 32,
    createdAt: "2024-01-20",
    modules: [
      {
        id: "m3",
        title: "ES6+ Features",
        description: "Modern JavaScript features",
        order: 1,
        units: [
          {
            id: "u7",
            title: "Arrow Functions",
            type: "video",
            duration: "12 min",
            order: 1,
          },
          {
            id: "u8",
            title: "Destructuring",
            type: "video",
            duration: "15 min",
            order: 2,
          },
        ],
      },
    ],
  },
]; 