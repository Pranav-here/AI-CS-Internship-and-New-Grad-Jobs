export interface SkillResource {
  name: string
  url: string
  type: "course" | "docs" | "video" | "tutorial"
}

export interface Skill {
  name: string
  category: string
  resources: SkillResource[]
}

export const SKILLS_DATABASE: Skill[] = [
  // Programming Languages
  {
    name: "Python",
    category: "Programming Languages",
    resources: [
      { name: "Python for Everybody (Coursera)", url: "https://www.coursera.org/specializations/python", type: "course" },
      { name: "Official Python Docs", url: "https://docs.python.org/3/", type: "docs" },
      { name: "Python Tutorial (freeCodeCamp)", url: "https://www.youtube.com/watch?v=rfscVS0vtbw", type: "video" },
    ],
  },
  {
    name: "JavaScript",
    category: "Programming Languages",
    resources: [
      { name: "JavaScript.info", url: "https://javascript.info/", type: "tutorial" },
      { name: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "docs" },
      { name: "JavaScript Full Course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=PkZNo7MFNFg", type: "video" },
    ],
  },
  {
    name: "TypeScript",
    category: "Programming Languages",
    resources: [
      { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "docs" },
      { name: "TypeScript Course (YouTube)", url: "https://www.youtube.com/watch?v=30LWjhZzg50", type: "video" },
    ],
  },
  {
    name: "Java",
    category: "Programming Languages",
    resources: [
      { name: "Java Programming (Coursera)", url: "https://www.coursera.org/specializations/java-programming", type: "course" },
      { name: "Oracle Java Docs", url: "https://docs.oracle.com/en/java/", type: "docs" },
    ],
  },
  {
    name: "C++",
    category: "Programming Languages",
    resources: [
      { name: "C++ Tutorial (learncpp.com)", url: "https://www.learncpp.com/", type: "tutorial" },
      { name: "C++ Reference", url: "https://en.cppreference.com/", type: "docs" },
    ],
  },
  {
    name: "Go",
    category: "Programming Languages",
    resources: [
      { name: "Tour of Go", url: "https://go.dev/tour/", type: "tutorial" },
      { name: "Go by Example", url: "https://gobyexample.com/", type: "tutorial" },
    ],
  },
  {
    name: "Rust",
    category: "Programming Languages",
    resources: [
      { name: "The Rust Book", url: "https://doc.rust-lang.org/book/", type: "docs" },
      { name: "Rust by Example", url: "https://doc.rust-lang.org/rust-by-example/", type: "tutorial" },
    ],
  },

  // Machine Learning & AI
  {
    name: "TensorFlow",
    category: "Machine Learning",
    resources: [
      { name: "TensorFlow Tutorial", url: "https://www.tensorflow.org/tutorials", type: "tutorial" },
      { name: "TensorFlow Developer Certificate", url: "https://www.coursera.org/professional-certificates/tensorflow-in-practice", type: "course" },
    ],
  },
  {
    name: "PyTorch",
    category: "Machine Learning",
    resources: [
      { name: "PyTorch Tutorials", url: "https://pytorch.org/tutorials/", type: "tutorial" },
      { name: "Deep Learning with PyTorch", url: "https://www.coursera.org/learn/deep-neural-networks-with-pytorch", type: "course" },
    ],
  },
  {
    name: "Scikit-learn",
    category: "Machine Learning",
    resources: [
      { name: "Scikit-learn Docs", url: "https://scikit-learn.org/stable/user_guide.html", type: "docs" },
      { name: "Machine Learning with Python", url: "https://www.coursera.org/learn/machine-learning-with-python", type: "course" },
    ],
  },
  {
    name: "Keras",
    category: "Machine Learning",
    resources: [
      { name: "Keras Documentation", url: "https://keras.io/guides/", type: "docs" },
      { name: "Deep Learning Specialization", url: "https://www.coursera.org/specializations/deep-learning", type: "course" },
    ],
  },
  {
    name: "MLflow",
    category: "Machine Learning",
    resources: [
      { name: "MLflow Docs", url: "https://mlflow.org/docs/latest/index.html", type: "docs" },
      { name: "MLOps Specialization", url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops", type: "course" },
    ],
  },
  {
    name: "Hugging Face",
    category: "Machine Learning",
    resources: [
      { name: "Hugging Face Course", url: "https://huggingface.co/course", type: "course" },
      { name: "Transformers Documentation", url: "https://huggingface.co/docs/transformers/", type: "docs" },
    ],
  },

  // Data Science
  {
    name: "Pandas",
    category: "Data Science",
    resources: [
      { name: "Pandas Documentation", url: "https://pandas.pydata.org/docs/", type: "docs" },
      { name: "Data Analysis with Python", url: "https://www.coursera.org/learn/data-analysis-with-python", type: "course" },
    ],
  },
  {
    name: "NumPy",
    category: "Data Science",
    resources: [
      { name: "NumPy Documentation", url: "https://numpy.org/doc/stable/", type: "docs" },
      { name: "NumPy Tutorial", url: "https://www.youtube.com/watch?v=QUT1VHiLmmI", type: "video" },
    ],
  },
  {
    name: "SQL",
    category: "Data Science",
    resources: [
      { name: "SQL for Data Science (Coursera)", url: "https://www.coursera.org/learn/sql-for-data-science", type: "course" },
      { name: "SQLBolt", url: "https://sqlbolt.com/", type: "tutorial" },
    ],
  },
  {
    name: "Tableau",
    category: "Data Science",
    resources: [
      { name: "Tableau Public Free Training", url: "https://public.tableau.com/app/learn/how-to-videos", type: "video" },
      { name: "Data Visualization with Tableau", url: "https://www.coursera.org/specializations/data-visualization", type: "course" },
    ],
  },
  {
    name: "Power BI",
    category: "Data Science",
    resources: [
      { name: "Microsoft Power BI Documentation", url: "https://docs.microsoft.com/en-us/power-bi/", type: "docs" },
      { name: "Power BI Essentials", url: "https://www.youtube.com/watch?v=AGrl-H87pRU", type: "video" },
    ],
  },

  // Web Development
  {
    name: "React",
    category: "Web Development",
    resources: [
      { name: "React Documentation", url: "https://react.dev/learn", type: "docs" },
      { name: "React - The Complete Guide", url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", type: "course" },
    ],
  },
  {
    name: "Node.js",
    category: "Web Development",
    resources: [
      { name: "Node.js Documentation", url: "https://nodejs.org/en/docs/", type: "docs" },
      { name: "Node.js Tutorial (freeCodeCamp)", url: "https://www.youtube.com/watch?v=Oe421EPjeBE", type: "video" },
    ],
  },
  {
    name: "Next.js",
    category: "Web Development",
    resources: [
      { name: "Next.js Documentation", url: "https://nextjs.org/docs", type: "docs" },
      { name: "Next.js Tutorial", url: "https://www.youtube.com/watch?v=9P8mASSREYM", type: "video" },
    ],
  },
  {
    name: "GraphQL",
    category: "Web Development",
    resources: [
      { name: "GraphQL.org", url: "https://graphql.org/learn/", type: "tutorial" },
      { name: "How to GraphQL", url: "https://www.howtographql.com/", type: "tutorial" },
    ],
  },
  {
    name: "REST API",
    category: "Web Development",
    resources: [
      { name: "RESTful API Design", url: "https://restfulapi.net/", type: "tutorial" },
      { name: "API Design Course", url: "https://www.coursera.org/learn/api-design-development", type: "course" },
    ],
  },

  // Cloud & DevOps
  {
    name: "AWS",
    category: "Cloud & DevOps",
    resources: [
      { name: "AWS Training", url: "https://aws.amazon.com/training/", type: "course" },
      { name: "AWS Solutions Architect", url: "https://www.coursera.org/learn/aws-fundamentals-building-serverless-applications", type: "course" },
    ],
  },
  {
    name: "Docker",
    category: "Cloud & DevOps",
    resources: [
      { name: "Docker Documentation", url: "https://docs.docker.com/get-started/", type: "docs" },
      { name: "Docker Tutorial (freeCodeCamp)", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo", type: "video" },
    ],
  },
  {
    name: "Kubernetes",
    category: "Cloud & DevOps",
    resources: [
      { name: "Kubernetes Documentation", url: "https://kubernetes.io/docs/tutorials/", type: "docs" },
      { name: "Kubernetes Course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=d6WC5n9G_sM", type: "video" },
    ],
  },
  {
    name: "CI/CD",
    category: "Cloud & DevOps",
    resources: [
      { name: "GitLab CI/CD", url: "https://docs.gitlab.com/ee/ci/", type: "docs" },
      { name: "DevOps Foundations", url: "https://www.coursera.org/specializations/devops-cloud-and-agile-foundations", type: "course" },
    ],
  },
  {
    name: "Terraform",
    category: "Cloud & DevOps",
    resources: [
      { name: "Terraform Documentation", url: "https://developer.hashicorp.com/terraform/docs", type: "docs" },
      { name: "Terraform Course (freeCodeCamp)", url: "https://www.youtube.com/watch?v=SLB_c_ayRMo", type: "video" },
    ],
  },
  {
    name: "Git",
    category: "Cloud & DevOps",
    resources: [
      { name: "Pro Git Book", url: "https://git-scm.com/book/en/v2", type: "docs" },
      { name: "Git Tutorial", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", type: "video" },
    ],
  },

  // Databases
  {
    name: "PostgreSQL",
    category: "Databases",
    resources: [
      { name: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/", type: "docs" },
      { name: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "tutorial" },
    ],
  },
  {
    name: "MongoDB",
    category: "Databases",
    resources: [
      { name: "MongoDB University", url: "https://learn.mongodb.com/", type: "course" },
      { name: "MongoDB Documentation", url: "https://www.mongodb.com/docs/", type: "docs" },
    ],
  },
  {
    name: "Redis",
    category: "Databases",
    resources: [
      { name: "Redis Documentation", url: "https://redis.io/docs/", type: "docs" },
      { name: "Redis University", url: "https://university.redis.com/", type: "course" },
    ],
  },

  // Other Important Skills
  {
    name: "Spark",
    category: "Big Data",
    resources: [
      { name: "Apache Spark Documentation", url: "https://spark.apache.org/docs/latest/", type: "docs" },
      { name: "Big Data Specialization", url: "https://www.coursera.org/specializations/big-data", type: "course" },
    ],
  },
  {
    name: "Hadoop",
    category: "Big Data",
    resources: [
      { name: "Hadoop Documentation", url: "https://hadoop.apache.org/docs/current/", type: "docs" },
      { name: "Hadoop Tutorial", url: "https://www.youtube.com/watch?v=mafw2-CVYnA", type: "video" },
    ],
  },
]

export function findSkillResources(skillName: string): SkillResource[] {
  const normalizedSearch = skillName.toLowerCase().trim()
  const skill = SKILLS_DATABASE.find((s) => s.name.toLowerCase() === normalizedSearch)
  return skill?.resources || []
}

export function getAllSkillNames(): string[] {
  return SKILLS_DATABASE.map((s) => s.name)
}

export function getSkillsByCategory(category: string): Skill[] {
  return SKILLS_DATABASE.filter((s) => s.category === category)
}

export function getCategories(): string[] {
  return Array.from(new Set(SKILLS_DATABASE.map((s) => s.category)))
}
