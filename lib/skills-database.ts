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
  {
    name: "C",
    category: "Programming Languages",
    resources: [
      { name: "Beej's Guide to C", url: "https://beej.us/guide/bgc/", type: "tutorial" },
      { name: "C Programming (freeCodeCamp)", url: "https://www.youtube.com/watch?v=KJgsSFOSQv0", type: "video" },
    ],
  },
  {
    name: "C#",
    category: "Programming Languages",
    resources: [
      { name: "C# Documentation", url: "https://learn.microsoft.com/en-us/dotnet/csharp/", type: "docs" },
      { name: "C# Fundamentals for Beginners", url: "https://www.youtube.com/watch?v=GhQdlIFylQ8", type: "video" },
    ],
  },
  {
    name: "Swift",
    category: "Programming Languages",
    resources: [
      { name: "The Swift Programming Language", url: "https://docs.swift.org/swift-book/", type: "docs" },
      { name: "Hacking with Swift", url: "https://www.hackingwithswift.com/read", type: "tutorial" },
    ],
  },
  {
    name: "Kotlin",
    category: "Programming Languages",
    resources: [
      { name: "Kotlin Docs", url: "https://kotlinlang.org/docs/home.html", type: "docs" },
      { name: "Android Basics with Kotlin", url: "https://developer.android.com/courses/android-basics-kotlin/course", type: "course" },
    ],
  },
  {
    name: "R",
    category: "Programming Languages",
    resources: [
      { name: "R for Data Science", url: "https://r4ds.had.co.nz/", type: "tutorial" },
      { name: "R Programming (Coursera)", url: "https://www.coursera.org/learn/r-programming", type: "course" },
    ],
  },
  {
    name: "Scala",
    category: "Programming Languages",
    resources: [
      { name: "Scala Documentation", url: "https://docs.scala-lang.org/scala3/book/introduction.html", type: "docs" },
      { name: "Functional Programming in Scala", url: "https://www.coursera.org/learn/progfun1", type: "course" },
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
  {
    name: "fast.ai",
    category: "Machine Learning",
    resources: [
      { name: "Practical Deep Learning for Coders", url: "https://course.fast.ai/", type: "course" },
      { name: "fast.ai Documentation", url: "https://docs.fast.ai/", type: "docs" },
    ],
  },
  {
    name: "JAX",
    category: "Machine Learning",
    resources: [
      { name: "JAX Quickstart", url: "https://jax.readthedocs.io/en/latest/notebooks/quickstart.html", type: "tutorial" },
      { name: "JAX 101", url: "https://jax.readthedocs.io/en/latest/jax-101/index.html", type: "docs" },
    ],
  },
  {
    name: "XGBoost",
    category: "Machine Learning",
    resources: [
      { name: "XGBoost Documentation", url: "https://xgboost.readthedocs.io/en/stable/", type: "docs" },
      { name: "Gradient Boosting Tutorial", url: "https://www.kaggle.com/code/alexisbcook/xgboost", type: "tutorial" },
    ],
  },
  {
    name: "LightGBM",
    category: "Machine Learning",
    resources: [
      { name: "LightGBM Documentation", url: "https://lightgbm.readthedocs.io/en/stable/", type: "docs" },
      { name: "LightGBM Quickstart (Kaggle)", url: "https://www.kaggle.com/code/prashant111/lightgbm-classifier-in-python", type: "tutorial" },
    ],
  },
  {
    name: "LangChain",
    category: "Machine Learning",
    resources: [
      { name: "LangChain Docs", url: "https://python.langchain.com/docs/get_started/introduction", type: "docs" },
      { name: "LangChain Crash Course", url: "https://www.youtube.com/watch?v=aywZrzNaKjs", type: "video" },
    ],
  },
  {
    name: "OpenCV",
    category: "Machine Learning",
    resources: [
      { name: "OpenCV Documentation", url: "https://docs.opencv.org/master/", type: "docs" },
      { name: "OpenCV Python Tutorial", url: "https://www.youtube.com/watch?v=oXlwWbU8l2o", type: "video" },
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
  {
    name: "Matplotlib",
    category: "Data Science",
    resources: [
      { name: "Matplotlib Docs", url: "https://matplotlib.org/stable/index.html", type: "docs" },
      { name: "Matplotlib Tutorial (Corey Schafer)", url: "https://www.youtube.com/watch?v=UO98lJQ3QGI", type: "video" },
    ],
  },
  {
    name: "Seaborn",
    category: "Data Science",
    resources: [
      { name: "Seaborn Tutorial", url: "https://seaborn.pydata.org/tutorial.html", type: "tutorial" },
      { name: "Seaborn Crash Course", url: "https://www.youtube.com/watch?v=6GUZXDef2U0", type: "video" },
    ],
  },
  {
    name: "Jupyter",
    category: "Data Science",
    resources: [
      { name: "Jupyter Documentation", url: "https://docs.jupyter.org/en/latest/", type: "docs" },
      { name: "Jupyter Notebook Tutorial", url: "https://www.youtube.com/watch?v=HW29067qVWk", type: "video" },
    ],
  },
  {
    name: "dbt",
    category: "Data Science",
    resources: [
      { name: "dbt Documentation", url: "https://docs.getdbt.com/docs/introduction", type: "docs" },
      { name: "dbt Fundamentals", url: "https://courses.getdbt.com/courses/dbt-fundamentals", type: "course" },
    ],
  },
  {
    name: "Apache Superset",
    category: "Data Science",
    resources: [
      { name: "Superset Documentation", url: "https://superset.apache.org/docs/intro", type: "docs" },
      { name: "Superset Tutorial", url: "https://www.youtube.com/watch?v=kxL_8aE76bc", type: "video" },
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
  {
    name: "Vue.js",
    category: "Web Development",
    resources: [
      { name: "Vue.js Guide", url: "https://vuejs.org/guide/introduction.html", type: "docs" },
      { name: "Vue Mastery Intro to Vue 3", url: "https://www.vuemastery.com/courses/intro-to-vue-3/intro-to-vue3", type: "course" },
    ],
  },
  {
    name: "Angular",
    category: "Web Development",
    resources: [
      { name: "Angular Docs", url: "https://angular.dev/overview", type: "docs" },
      { name: "Angular - The Complete Guide", url: "https://www.udemy.com/course/the-complete-guide-to-angular-2/", type: "course" },
    ],
  },
  {
    name: "Svelte",
    category: "Web Development",
    resources: [
      { name: "Svelte Tutorial", url: "https://learn.svelte.dev/tutorial/welcome-to-svelte", type: "tutorial" },
      { name: "SvelteKit Docs", url: "https://kit.svelte.dev/docs/introduction", type: "docs" },
    ],
  },
  {
    name: "Express",
    category: "Web Development",
    resources: [
      { name: "Express Guide", url: "https://expressjs.com/en/starter/installing.html", type: "docs" },
      { name: "Express JS Crash Course", url: "https://www.youtube.com/watch?v=L72fhGm1tfE", type: "video" },
    ],
  },
  {
    name: "Django",
    category: "Web Development",
    resources: [
      { name: "Django Documentation", url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/", type: "docs" },
      { name: "Django for Beginners", url: "https://www.djangoproject.com/start/", type: "tutorial" },
    ],
  },
  {
    name: "Flask",
    category: "Web Development",
    resources: [
      { name: "Flask Documentation", url: "https://flask.palletsprojects.com/en/stable/tutorial/", type: "docs" },
      { name: "Flask Mega-Tutorial", url: "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world", type: "tutorial" },
    ],
  },
  {
    name: "Tailwind CSS",
    category: "Web Development",
    resources: [
      { name: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs/installation", type: "docs" },
      { name: "Tailwind From Scratch", url: "https://www.youtube.com/watch?v=dFgzHOX84xQ", type: "video" },
    ],
  },
  {
    name: "Redux",
    category: "Web Development",
    resources: [
      { name: "Redux Essentials", url: "https://redux.js.org/tutorials/essentials/part-1-overview-concepts", type: "tutorial" },
      { name: "Redux Toolkit Docs", url: "https://redux-toolkit.js.org/introduction/getting-started", type: "docs" },
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
  {
    name: "Azure",
    category: "Cloud & DevOps",
    resources: [
      { name: "Microsoft Learn Azure", url: "https://learn.microsoft.com/en-us/azure/?product=popular", type: "docs" },
      { name: "AZ-900 Azure Fundamentals", url: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/", type: "course" },
    ],
  },
  {
    name: "Google Cloud",
    category: "Cloud & DevOps",
    resources: [
      { name: "Google Cloud Training", url: "https://cloud.google.com/training", type: "course" },
      { name: "Google Cloud Docs", url: "https://cloud.google.com/docs", type: "docs" },
    ],
  },
  {
    name: "Ansible",
    category: "Cloud & DevOps",
    resources: [
      { name: "Ansible Documentation", url: "https://docs.ansible.com/ansible/latest/getting_started/index.html", type: "docs" },
      { name: "Ansible for the Absolute Beginner", url: "https://www.udemy.com/course/learn-ansible/", type: "course" },
    ],
  },
  {
    name: "Jenkins",
    category: "Cloud & DevOps",
    resources: [
      { name: "Jenkins User Handbook", url: "https://www.jenkins.io/doc/", type: "docs" },
      { name: "Jenkins Tutorial (freeCodeCamp)", url: "https://www.youtube.com/watch?v=7KCS70sCoK0", type: "video" },
    ],
  },
  {
    name: "GitHub Actions",
    category: "Cloud & DevOps",
    resources: [
      { name: "GitHub Actions Docs", url: "https://docs.github.com/en/actions", type: "docs" },
      { name: "GitHub Actions Tutorial", url: "https://www.youtube.com/watch?v=R8_veQiYBjI", type: "video" },
    ],
  },
  {
    name: "Linux",
    category: "Cloud & DevOps",
    resources: [
      { name: "Linux Journey", url: "https://linuxjourney.com/", type: "tutorial" },
      { name: "Linux Command Line Basics", url: "https://www.coursera.org/learn/linux-command-line-basics", type: "course" },
    ],
  },
  {
    name: "Bash Scripting",
    category: "Cloud & DevOps",
    resources: [
      { name: "Bash Guide", url: "https://www.gnu.org/software/bash/manual/bash.html", type: "docs" },
      { name: "Bash Scripting Full Course", url: "https://www.youtube.com/watch?v=e7BufAVwDiM", type: "video" },
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
  {
    name: "MySQL",
    category: "Databases",
    resources: [
      { name: "MySQL Documentation", url: "https://dev.mysql.com/doc/refman/8.0/en/", type: "docs" },
      { name: "MySQL for Beginners", url: "https://www.youtube.com/watch?v=7S_tz1z_5bA", type: "video" },
    ],
  },
  {
    name: "SQLite",
    category: "Databases",
    resources: [
      { name: "SQLite Documentation", url: "https://www.sqlite.org/docs.html", type: "docs" },
      { name: "SQLite Tutorial", url: "https://www.sqlitetutorial.net/", type: "tutorial" },
    ],
  },
  {
    name: "DynamoDB",
    category: "Databases",
    resources: [
      { name: "DynamoDB Developer Guide", url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html", type: "docs" },
      { name: "DynamoDB Crash Course", url: "https://www.youtube.com/watch?v=HaEPXoXVf2k", type: "video" },
    ],
  },
  {
    name: "Cassandra",
    category: "Databases",
    resources: [
      { name: "Cassandra Documentation", url: "https://cassandra.apache.org/doc/stable/", type: "docs" },
      { name: "Cassandra Crash Course", url: "https://www.youtube.com/watch?v=n71syaqgFv0", type: "video" },
    ],
  },
  {
    name: "Snowflake",
    category: "Databases",
    resources: [
      { name: "Snowflake Guides", url: "https://docs.snowflake.com/en/user-guide/intro-key-concepts", type: "docs" },
      { name: "Snowflake Fundamentals", url: "https://www.udemy.com/course/snowflake-cloud-data-warehouse-fundamentals/", type: "course" },
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
  {
    name: "Apache Kafka",
    category: "Big Data",
    resources: [
      { name: "Kafka Documentation", url: "https://kafka.apache.org/documentation/", type: "docs" },
      { name: "Kafka Series - Udemy", url: "https://www.udemy.com/course/kafka-streams/", type: "course" },
    ],
  },
  {
    name: "Apache Airflow",
    category: "Big Data",
    resources: [
      { name: "Airflow Documentation", url: "https://airflow.apache.org/docs/apache-airflow/stable/index.html", type: "docs" },
      { name: "Airflow Tutorial", url: "https://www.youtube.com/watch?v=AHMm1wfGuHE", type: "video" },
    ],
  },

  // Mobile Development
  {
    name: "React Native",
    category: "Mobile Development",
    resources: [
      { name: "React Native Docs", url: "https://reactnative.dev/docs/environment-setup", type: "docs" },
      { name: "React Native Tutorial", url: "https://www.youtube.com/watch?v=0-S5a0eXPoc", type: "video" },
    ],
  },
  {
    name: "Flutter",
    category: "Mobile Development",
    resources: [
      { name: "Flutter Docs", url: "https://docs.flutter.dev/get-started/install", type: "docs" },
      { name: "Flutter Course for Beginners", url: "https://www.youtube.com/watch?v=VPvVD8t02U8", type: "video" },
    ],
  },
  {
    name: "Android",
    category: "Mobile Development",
    resources: [
      { name: "Android Developers Training", url: "https://developer.android.com/courses", type: "course" },
      { name: "Android Documentation", url: "https://developer.android.com/docs", type: "docs" },
    ],
  },
  {
    name: "SwiftUI",
    category: "Mobile Development",
    resources: [
      { name: "SwiftUI Tutorials", url: "https://developer.apple.com/tutorials/swiftui", type: "tutorial" },
      { name: "SwiftUI Docs", url: "https://developer.apple.com/documentation/swiftui", type: "docs" },
    ],
  },
  {
    name: "Ionic",
    category: "Mobile Development",
    resources: [
      { name: "Ionic Documentation", url: "https://ionicframework.com/docs", type: "docs" },
      { name: "Ionic Framework Crash Course", url: "https://www.youtube.com/watch?v=AvbuIRg8_Jg", type: "video" },
    ],
  },
  {
    name: "Xamarin",
    category: "Mobile Development",
    resources: [
      { name: "Xamarin Documentation", url: "https://learn.microsoft.com/en-us/xamarin/", type: "docs" },
      { name: "Xamarin Tutorial for Beginners", url: "https://www.youtube.com/watch?v=zvp7wvbyceo", type: "video" },
    ],
  },

  // Security & Cybersecurity
  {
    name: "Penetration Testing",
    category: "Security",
    resources: [
      { name: "Offensive Security Training (OSCP)", url: "https://www.offensive-security.com/pwk-oscp/", type: "course" },
      { name: "Ethical Hacking Course", url: "https://www.coursera.org/learn/ethical-hacking-essentials-ehe", type: "course" },
    ],
  },
  {
    name: "OWASP",
    category: "Security",
    resources: [
      { name: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "docs" },
      { name: "OWASP Web Security Testing Guide", url: "https://owasp.org/www-project-web-security-testing-guide/", type: "docs" },
    ],
  },
  {
    name: "Cryptography",
    category: "Security",
    resources: [
      { name: "Cryptography I (Stanford)", url: "https://www.coursera.org/learn/crypto", type: "course" },
      { name: "Applied Cryptography", url: "https://www.youtube.com/watch?v=2aHkqB2-46k", type: "video" },
    ],
  },
  {
    name: "Network Security",
    category: "Security",
    resources: [
      { name: "Network Security Fundamentals", url: "https://www.coursera.org/learn/network-security", type: "course" },
      { name: "Wireshark Tutorial", url: "https://www.youtube.com/watch?v=TkCSr30UojM", type: "video" },
    ],
  },
  {
    name: "Security+",
    category: "Security",
    resources: [
      { name: "CompTIA Security+ Certification", url: "https://www.comptia.org/certifications/security", type: "course" },
      { name: "Professor Messer Security+ Course", url: "https://www.professormesser.com/security-plus/sy0-701/sy0-701-video/sy0-701-comptia-security-plus-course/", type: "video" },
    ],
  },
  {
    name: "Metasploit",
    category: "Security",
    resources: [
      { name: "Metasploit Unleashed", url: "https://www.offensive-security.com/metasploit-unleashed/", type: "course" },
      { name: "Metasploit Framework Tutorial", url: "https://www.youtube.com/watch?v=8lR27r8Y_ik", type: "video" },
    ],
  },
  {
    name: "Burp Suite",
    category: "Security",
    resources: [
      { name: "Burp Suite Documentation", url: "https://portswigger.net/burp/documentation", type: "docs" },
      { name: "Web Security Academy (PortSwigger)", url: "https://portswigger.net/web-security", type: "course" },
    ],
  },
  {
    name: "Nmap",
    category: "Security",
    resources: [
      { name: "Nmap Documentation", url: "https://nmap.org/book/man.html", type: "docs" },
      { name: "Nmap Tutorial", url: "https://www.youtube.com/watch?v=4t4kBkMsDbQ", type: "video" },
    ],
  },

  // Testing & Quality Assurance
  {
    name: "Jest",
    category: "Testing",
    resources: [
      { name: "Jest Documentation", url: "https://jestjs.io/docs/getting-started", type: "docs" },
      { name: "Jest Crash Course", url: "https://www.youtube.com/watch?v=7r4xVDI2vho", type: "video" },
    ],
  },
  {
    name: "Pytest",
    category: "Testing",
    resources: [
      { name: "Pytest Documentation", url: "https://docs.pytest.org/en/stable/", type: "docs" },
      { name: "Pytest Tutorial", url: "https://www.youtube.com/watch?v=cHYq1MRoyI0", type: "video" },
    ],
  },
  {
    name: "Selenium",
    category: "Testing",
    resources: [
      { name: "Selenium Documentation", url: "https://www.selenium.dev/documentation/", type: "docs" },
      { name: "Selenium WebDriver Tutorial", url: "https://www.youtube.com/watch?v=j7VZsCCnptM", type: "video" },
    ],
  },
  {
    name: "Cypress",
    category: "Testing",
    resources: [
      { name: "Cypress Documentation", url: "https://docs.cypress.io/guides/overview/why-cypress", type: "docs" },
      { name: "Cypress E2E Testing Tutorial", url: "https://www.youtube.com/watch?v=u8vMu7viCm8", type: "video" },
    ],
  },
  {
    name: "JUnit",
    category: "Testing",
    resources: [
      { name: "JUnit 5 User Guide", url: "https://junit.org/junit5/docs/current/user-guide/", type: "docs" },
      { name: "JUnit Tutorial for Beginners", url: "https://www.youtube.com/watch?v=vZm0lHciFsQ", type: "video" },
    ],
  },
  {
    name: "Mocha",
    category: "Testing",
    resources: [
      { name: "Mocha Documentation", url: "https://mochajs.org/", type: "docs" },
      { name: "Mocha Testing Framework Tutorial", url: "https://www.youtube.com/watch?v=MLTRHc5dk6s", type: "video" },
    ],
  },
  {
    name: "Postman",
    category: "Testing",
    resources: [
      { name: "Postman Learning Center", url: "https://learning.postman.com/", type: "docs" },
      { name: "Postman API Testing Tutorial", url: "https://www.youtube.com/watch?v=VywxIQ2ZXw4", type: "video" },
    ],
  },
  {
    name: "Playwright",
    category: "Testing",
    resources: [
      { name: "Playwright Documentation", url: "https://playwright.dev/docs/intro", type: "docs" },
      { name: "Playwright Tutorial", url: "https://www.youtube.com/watch?v=wawbt1cATsk", type: "video" },
    ],
  },

  // Blockchain & Web3
  {
    name: "Solidity",
    category: "Blockchain",
    resources: [
      { name: "Solidity Documentation", url: "https://docs.soliditylang.org/", type: "docs" },
      { name: "Solidity, Blockchain, and Smart Contract Course", url: "https://www.youtube.com/watch?v=M576WGiDBdQ", type: "video" },
    ],
  },
  {
    name: "Ethereum",
    category: "Blockchain",
    resources: [
      { name: "Ethereum.org Developers", url: "https://ethereum.org/en/developers/", type: "docs" },
      { name: "Ethereum Development Course", url: "https://www.coursera.org/learn/blockchain-basics", type: "course" },
    ],
  },
  {
    name: "Web3.js",
    category: "Blockchain",
    resources: [
      { name: "Web3.js Documentation", url: "https://web3js.readthedocs.io/", type: "docs" },
      { name: "Web3.js Tutorial", url: "https://www.youtube.com/watch?v=t3wM5903ty0", type: "video" },
    ],
  },
  {
    name: "Hardhat",
    category: "Blockchain",
    resources: [
      { name: "Hardhat Documentation", url: "https://hardhat.org/docs", type: "docs" },
      { name: "Hardhat Tutorial", url: "https://www.youtube.com/watch?v=gyMwXuJrbJQ", type: "video" },
    ],
  },
  {
    name: "Truffle",
    category: "Blockchain",
    resources: [
      { name: "Truffle Suite Documentation", url: "https://trufflesuite.com/docs/", type: "docs" },
      { name: "Truffle Tutorial", url: "https://www.youtube.com/watch?v=62f757RVEvU", type: "video" },
    ],
  },

  // Game Development
  {
    name: "Unity",
    category: "Game Development",
    resources: [
      { name: "Unity Learn", url: "https://learn.unity.com/", type: "course" },
      { name: "Unity Documentation", url: "https://docs.unity3d.com/Manual/index.html", type: "docs" },
    ],
  },
  {
    name: "Unreal Engine",
    category: "Game Development",
    resources: [
      { name: "Unreal Engine Documentation", url: "https://docs.unrealengine.com/5.3/en-US/", type: "docs" },
      { name: "Unreal Engine C++ Tutorial", url: "https://www.youtube.com/watch?v=LsNW4FPHuZE", type: "video" },
    ],
  },
  {
    name: "Godot",
    category: "Game Development",
    resources: [
      { name: "Godot Documentation", url: "https://docs.godotengine.org/en/stable/", type: "docs" },
      { name: "Godot Tutorial for Beginners", url: "https://www.youtube.com/watch?v=LOhfqjmasi0", type: "video" },
    ],
  },
  {
    name: "Phaser",
    category: "Game Development",
    resources: [
      { name: "Phaser Documentation", url: "https://phaser.io/learn", type: "docs" },
      { name: "Phaser 3 Tutorial", url: "https://www.youtube.com/watch?v=frRWKxB9Hm0", type: "video" },
    ],
  },

  // Design & UX
  {
    name: "Figma",
    category: "Design",
    resources: [
      { name: "Figma Learn", url: "https://help.figma.com/hc/en-us", type: "docs" },
      { name: "Figma UI Design Tutorial", url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", type: "video" },
    ],
  },
  {
    name: "Adobe XD",
    category: "Design",
    resources: [
      { name: "Adobe XD Documentation", url: "https://helpx.adobe.com/xd/user-guide.html", type: "docs" },
      { name: "Adobe XD Tutorial", url: "https://www.youtube.com/watch?v=68w2VwalD5w", type: "video" },
    ],
  },
  {
    name: "UI/UX Design Principles",
    category: "Design",
    resources: [
      { name: "Google UX Design Certificate", url: "https://www.coursera.org/professional-certificates/google-ux-design", type: "course" },
      { name: "Laws of UX", url: "https://lawsofux.com/", type: "docs" },
    ],
  },
  {
    name: "Sketch",
    category: "Design",
    resources: [
      { name: "Sketch Documentation", url: "https://www.sketch.com/docs/", type: "docs" },
      { name: "Sketch Tutorial for Beginners", url: "https://www.youtube.com/watch?v=cEplnCnZuDM", type: "video" },
    ],
  },

  // System Design & Architecture
  {
    name: "System Design",
    category: "System Design",
    resources: [
      { name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "docs" },
      { name: "System Design Interview Course", url: "https://www.youtube.com/watch?v=bUHFg8CZFws", type: "video" },
    ],
  },
  {
    name: "Microservices",
    category: "System Design",
    resources: [
      { name: "Microservices.io", url: "https://microservices.io/patterns/microservices.html", type: "docs" },
      { name: "Microservices Architecture", url: "https://www.coursera.org/learn/microservices-architecture", type: "course" },
    ],
  },
  {
    name: "Design Patterns",
    category: "System Design",
    resources: [
      { name: "Refactoring.Guru Design Patterns", url: "https://refactoring.guru/design-patterns", type: "tutorial" },
      { name: "Design Patterns in Object Oriented Programming", url: "https://www.youtube.com/watch?v=v9ejT8FO-7I", type: "video" },
    ],
  },
  {
    name: "Event-Driven Architecture",
    category: "System Design",
    resources: [
      { name: "Event-Driven Architecture Guide", url: "https://aws.amazon.com/event-driven-architecture/", type: "docs" },
      { name: "Event-Driven Architecture Tutorial", url: "https://www.youtube.com/watch?v=STKCRSUsyP0", type: "video" },
    ],
  },

  // Networking
  {
    name: "TCP/IP",
    category: "Networking",
    resources: [
      { name: "TCP/IP Guide", url: "http://www.tcpipguide.com/free/index.htm", type: "docs" },
      { name: "Computer Networking Course", url: "https://www.youtube.com/watch?v=qiQR5rTSshw", type: "video" },
    ],
  },
  {
    name: "HTTP/HTTPS",
    category: "Networking",
    resources: [
      { name: "MDN HTTP Documentation", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP", type: "docs" },
      { name: "HTTP Crash Course & Exploration", url: "https://www.youtube.com/watch?v=iYM2zFP3Zn0", type: "video" },
    ],
  },
  {
    name: "DNS",
    category: "Networking",
    resources: [
      { name: "How DNS Works", url: "https://howdns.works/", type: "tutorial" },
      { name: "DNS Explained", url: "https://www.youtube.com/watch?v=72snZctFFtA", type: "video" },
    ],
  },
  {
    name: "Load Balancing",
    category: "Networking",
    resources: [
      { name: "Nginx Load Balancing", url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/", type: "docs" },
      { name: "Load Balancing Concepts", url: "https://www.youtube.com/watch?v=K0Ta65OqQkY", type: "video" },
    ],
  },

  // Additional Programming Languages
  {
    name: "Ruby",
    category: "Programming Languages",
    resources: [
      { name: "Ruby Documentation", url: "https://www.ruby-lang.org/en/documentation/", type: "docs" },
      { name: "Ruby on Rails Tutorial", url: "https://www.railstutorial.org/book", type: "tutorial" },
    ],
  },
  {
    name: "PHP",
    category: "Programming Languages",
    resources: [
      { name: "PHP Manual", url: "https://www.php.net/manual/en/index.php", type: "docs" },
      { name: "PHP Programming Course", url: "https://www.youtube.com/watch?v=OK_JCtrrv-c", type: "video" },
    ],
  },
  {
    name: "Dart",
    category: "Programming Languages",
    resources: [
      { name: "Dart Documentation", url: "https://dart.dev/guides", type: "docs" },
      { name: "Dart Programming Tutorial", url: "https://www.youtube.com/watch?v=Ej_Pcr4uC2Q", type: "video" },
    ],
  },
  {
    name: "Elixir",
    category: "Programming Languages",
    resources: [
      { name: "Elixir School", url: "https://elixirschool.com/en", type: "tutorial" },
      { name: "Elixir Documentation", url: "https://elixir-lang.org/docs.html", type: "docs" },
    ],
  },
  {
    name: "Haskell",
    category: "Programming Languages",
    resources: [
      { name: "Learn You a Haskell", url: "http://learnyouahaskell.com/", type: "tutorial" },
      { name: "Haskell Programming from First Principles", url: "https://www.youtube.com/watch?v=02_H3LjqMr8", type: "video" },
    ],
  },

  // Additional Web Development Frameworks
  {
    name: "NestJS",
    category: "Web Development",
    resources: [
      { name: "NestJS Documentation", url: "https://docs.nestjs.com/", type: "docs" },
      { name: "NestJS Crash Course", url: "https://www.youtube.com/watch?v=GHTA143_b-s", type: "video" },
    ],
  },
  {
    name: "FastAPI",
    category: "Web Development",
    resources: [
      { name: "FastAPI Documentation", url: "https://fastapi.tiangolo.com/", type: "docs" },
      { name: "FastAPI Tutorial", url: "https://www.youtube.com/watch?v=0sOvCWFmrtA", type: "video" },
    ],
  },
  {
    name: "Spring Boot",
    category: "Web Development",
    resources: [
      { name: "Spring Boot Documentation", url: "https://spring.io/projects/spring-boot", type: "docs" },
      { name: "Spring Boot Tutorial", url: "https://www.youtube.com/watch?v=9SGDpanrc8U", type: "video" },
    ],
  },
  {
    name: "ASP.NET Core",
    category: "Web Development",
    resources: [
      { name: "ASP.NET Core Documentation", url: "https://learn.microsoft.com/en-us/aspnet/core/", type: "docs" },
      { name: "ASP.NET Core Tutorial", url: "https://www.youtube.com/watch?v=BfEjDD8mWYg", type: "video" },
    ],
  },
  {
    name: "Laravel",
    category: "Web Development",
    resources: [
      { name: "Laravel Documentation", url: "https://laravel.com/docs", type: "docs" },
      { name: "Laravel From Scratch", url: "https://laracasts.com/series/laravel-from-scratch", type: "course" },
    ],
  },

  // Additional Cloud & DevOps Tools
  {
    name: "Prometheus",
    category: "Cloud & DevOps",
    resources: [
      { name: "Prometheus Documentation", url: "https://prometheus.io/docs/introduction/overview/", type: "docs" },
      { name: "Prometheus Monitoring Tutorial", url: "https://www.youtube.com/watch?v=h4Sl21AKiDg", type: "video" },
    ],
  },
  {
    name: "Grafana",
    category: "Cloud & DevOps",
    resources: [
      { name: "Grafana Documentation", url: "https://grafana.com/docs/grafana/latest/", type: "docs" },
      { name: "Grafana Crash Course", url: "https://www.youtube.com/watch?v=QD3xvPY7HsY", type: "video" },
    ],
  },
  {
    name: "Helm",
    category: "Cloud & DevOps",
    resources: [
      { name: "Helm Documentation", url: "https://helm.sh/docs/", type: "docs" },
      { name: "Helm Tutorial for Beginners", url: "https://www.youtube.com/watch?v=fy8SHvNZGeE", type: "video" },
    ],
  },
  {
    name: "Vault",
    category: "Cloud & DevOps",
    resources: [
      { name: "Vault by HashiCorp Documentation", url: "https://developer.hashicorp.com/vault/docs", type: "docs" },
      { name: "HashiCorp Vault Tutorial", url: "https://www.youtube.com/watch?v=VYfl-DpZ5wM", type: "video" },
    ],
  },
  {
    name: "Elasticsearch",
    category: "Cloud & DevOps",
    resources: [
      { name: "Elasticsearch Documentation", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html", type: "docs" },
      { name: "Elasticsearch Tutorial", url: "https://www.youtube.com/watch?v=gS_nHTWZEJ8", type: "video" },
    ],
  },

  // Additional Databases
  {
    name: "Neo4j",
    category: "Databases",
    resources: [
      { name: "Neo4j Documentation", url: "https://neo4j.com/docs/", type: "docs" },
      { name: "Neo4j Graph Database Tutorial", url: "https://www.youtube.com/watch?v=8jNPelugC2s", type: "video" },
    ],
  },
  {
    name: "CouchDB",
    category: "Databases",
    resources: [
      { name: "CouchDB Documentation", url: "https://docs.couchdb.org/en/stable/", type: "docs" },
      { name: "CouchDB Tutorial", url: "https://www.youtube.com/watch?v=nlqv9Np3iAU", type: "video" },
    ],
  },
  {
    name: "InfluxDB",
    category: "Databases",
    resources: [
      { name: "InfluxDB Documentation", url: "https://docs.influxdata.com/", type: "docs" },
      { name: "Time Series Databases with InfluxDB", url: "https://www.youtube.com/watch?v=aaQGEjZ5lXg", type: "video" },
    ],
  },

  // Message Queues & Streaming
  {
    name: "RabbitMQ",
    category: "Message Queues",
    resources: [
      { name: "RabbitMQ Documentation", url: "https://www.rabbitmq.com/documentation.html", type: "docs" },
      { name: "RabbitMQ Tutorial", url: "https://www.youtube.com/watch?v=7rkeORD4jSw", type: "video" },
    ],
  },
  {
    name: "Apache Pulsar",
    category: "Message Queues",
    resources: [
      { name: "Apache Pulsar Documentation", url: "https://pulsar.apache.org/docs/", type: "docs" },
      { name: "Apache Pulsar Tutorial", url: "https://www.youtube.com/watch?v=oSrURA0E6yA", type: "video" },
    ],
  },
  {
    name: "NATS",
    category: "Message Queues",
    resources: [
      { name: "NATS Documentation", url: "https://docs.nats.io/", type: "docs" },
      { name: "NATS Messaging System", url: "https://www.youtube.com/watch?v=hjXIUPZ7ArA", type: "video" },
    ],
  },

  // Additional Machine Learning & AI
  {
    name: "Scikit-image",
    category: "Machine Learning",
    resources: [
      { name: "Scikit-image Documentation", url: "https://scikit-image.org/docs/stable/", type: "docs" },
      { name: "Image Processing with Scikit-image", url: "https://www.youtube.com/watch?v=d1CIV9irQAY", type: "video" },
    ],
  },
  {
    name: "NLTK",
    category: "Machine Learning",
    resources: [
      { name: "NLTK Documentation", url: "https://www.nltk.org/", type: "docs" },
      { name: "Natural Language Processing with Python", url: "https://www.youtube.com/watch?v=X2vAabgKiuM", type: "video" },
    ],
  },
  {
    name: "spaCy",
    category: "Machine Learning",
    resources: [
      { name: "spaCy Documentation", url: "https://spacy.io/usage", type: "docs" },
      { name: "spaCy NLP Tutorial", url: "https://www.youtube.com/watch?v=dIUTsFT2MeQ", type: "video" },
    ],
  },
  {
    name: "ONNX",
    category: "Machine Learning",
    resources: [
      { name: "ONNX Documentation", url: "https://onnx.ai/", type: "docs" },
      { name: "ONNX Tutorial", url: "https://www.youtube.com/watch?v=7nupjho3YlQ", type: "video" },
    ],
  },

  // IoT & Embedded Systems
  {
    name: "Arduino",
    category: "IoT",
    resources: [
      { name: "Arduino Documentation", url: "https://docs.arduino.cc/", type: "docs" },
      { name: "Arduino Tutorial for Beginners", url: "https://www.youtube.com/watch?v=zJ-LqeX_fLU", type: "video" },
    ],
  },
  {
    name: "Raspberry Pi",
    category: "IoT",
    resources: [
      { name: "Raspberry Pi Documentation", url: "https://www.raspberrypi.com/documentation/", type: "docs" },
      { name: "Raspberry Pi Tutorial", url: "https://www.youtube.com/watch?v=ntaXWS8Lk34", type: "video" },
    ],
  },
  {
    name: "MQTT",
    category: "IoT",
    resources: [
      { name: "MQTT Essentials", url: "https://www.hivemq.com/mqtt-essentials/", type: "tutorial" },
      { name: "MQTT Protocol Tutorial", url: "https://www.youtube.com/watch?v=EIxdz-2rhLs", type: "video" },
    ],
  },
  {
    name: "ESP32",
    category: "IoT",
    resources: [
      { name: "ESP32 Documentation", url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/", type: "docs" },
      { name: "ESP32 Tutorial", url: "https://www.youtube.com/watch?v=xPlN_Tk3VLQ", type: "video" },
    ],
  },

  // API Development
  {
    name: "gRPC",
    category: "API Development",
    resources: [
      { name: "gRPC Documentation", url: "https://grpc.io/docs/", type: "docs" },
      { name: "gRPC Crash Course", url: "https://www.youtube.com/watch?v=Yw4rkaTc0f8", type: "video" },
    ],
  },
  {
    name: "Swagger/OpenAPI",
    category: "API Development",
    resources: [
      { name: "OpenAPI Specification", url: "https://swagger.io/specification/", type: "docs" },
      { name: "Swagger Tutorial", url: "https://www.youtube.com/watch?v=7MS1Z_1c5CU", type: "video" },
    ],
  },
  {
    name: "WebSocket",
    category: "API Development",
    resources: [
      { name: "WebSocket API (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSocket", type: "docs" },
      { name: "WebSocket Tutorial", url: "https://www.youtube.com/watch?v=1BfCnjr_Vjg", type: "video" },
    ],
  },

  // Version Control & Collaboration
  {
    name: "GitHub",
    category: "Version Control",
    resources: [
      { name: "GitHub Docs", url: "https://docs.github.com/en", type: "docs" },
      { name: "GitHub for Beginners", url: "https://www.youtube.com/watch?v=RGOj5yH7evk", type: "video" },
    ],
  },
  {
    name: "GitLab",
    category: "Version Control",
    resources: [
      { name: "GitLab Documentation", url: "https://docs.gitlab.com/", type: "docs" },
      { name: "GitLab CI/CD Tutorial", url: "https://www.youtube.com/watch?v=8aV5AxJrHDg", type: "video" },
    ],
  },

  // Additional Data Science Tools
  {
    name: "Apache Spark MLlib",
    category: "Data Science",
    resources: [
      { name: "Spark MLlib Documentation", url: "https://spark.apache.org/docs/latest/ml-guide.html", type: "docs" },
      { name: "Spark MLlib Tutorial", url: "https://www.youtube.com/watch?v=zC9cnh8rJd0", type: "video" },
    ],
  },
  {
    name: "Plotly",
    category: "Data Science",
    resources: [
      { name: "Plotly Documentation", url: "https://plotly.com/python/", type: "docs" },
      { name: "Plotly Python Tutorial", url: "https://www.youtube.com/watch?v=GGL6U0k8WYA", type: "video" },
    ],
  },
  {
    name: "Apache Arrow",
    category: "Data Science",
    resources: [
      { name: "Apache Arrow Documentation", url: "https://arrow.apache.org/docs/", type: "docs" },
      { name: "Apache Arrow Tutorial", url: "https://www.youtube.com/watch?v=fyj4FyH3XdU", type: "video" },
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
