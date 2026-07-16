import { db } from "../config/firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

const defaultCourse = {
  title: "90 Days Plan, Dot Net Full Stack Development",
  description: "This Course is '90 Days Software Development Training and Placement Assistance Program' in the Dotnet Full Stack for the Freshers , UnderGrads, Career Refresh, Job Switch and all other People , who want to build a career in software development.",
  youtubePlaylistUrl: "https://senak360.com/@Senak360",
  syllabusUrl: "https://senak360.com/syllabus/dotnet-full-stack",
  pdfUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
  imageUrl: "https://senak360.com/images/dotnet-90days.png",
  subjects: [
    {
      name: "Internet and Real Application - Computer Internal Working",
      totalModules: 3,
      completedModules: 3,
      status: "Completed",
      modules: [
        {
          title: "Day 1 - Client-Server Architecture",
          description: "Understanding request-response cycles, web browsers and servers.",
          tags: ["Client Server", "Networking Basics"],
          watchUrl: "https://www.youtube.com/watch?v=day1",
          materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
          status: "Done"
        },
        {
          title: "Day 2 - How DNS Resolution Works",
          description: "How domain names are mapped to IP addresses via DNS servers.",
          tags: ["DNS", "IP Address", "Internet Protocols"],
          watchUrl: "https://www.youtube.com/watch?v=day2",
          materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
          status: "Done"
        },
        {
          title: "Day 3 - Introduction to Internet and World",
          description: "Here you learn about the internet and how the real world applications work.",
          tags: ["HTML and Browser Understanding", "how Real Applications Works"],
          watchUrl: "https://www.youtube.com/watch?v=day3",
          materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
          status: "Done"
        }
      ]
    },
    {
      name: "Html/Html5",
      totalModules: 21,
      completedModules: 21,
      status: "Completed",
      modules: [
        {
          title: "Day 4 - Live Software Installation , Career guidance",
          description: "Live Doubt Clearing, career prospects in Full Stack, and local setup of IDEs (VS Code, VS 2022).",
          tags: ["Live Doubt Clearing", "Career Guidance", "Software Installation"],
          watchUrl: "https://www.youtube.com/watch?v=day4",
          materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
          status: "Done"
        },
        {
          title: "Day 5 - HTML Introduction to Web Development",
          description: "In this module, sets the stage, getting you used to important concepts and syntax, looking at applying HTML to text, how to create hyperlinks, and how to use HTML to structure a webpage.",
          tags: ["HTML Basics", "Structure", "Hyperlinks"],
          watchUrl: "https://www.youtube.com/watch?v=day5",
          materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
          status: "Done"
        },
        // Populate additional mock days to match the 21 modules requirement
        ...Array.from({ length: 19 }, (_, i) => ({
          title: `Day ${i + 6} - HTML5 Advanced Features (Part ${i + 1})`,
          description: `Deep dive into HTML5 semantic elements, forms, media tags, and canvas (session ${i + 1}).`,
          tags: ["HTML5", "Web Development"],
          watchUrl: `https://www.youtube.com/watch?v=day${i + 6}`,
          materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
          status: "Done"
        }))
      ]
    },
    {
      name: "Css/Css3",
      totalModules: 27,
      completedModules: 27,
      status: "Completed",
      modules: Array.from({ length: 27 }, (_, i) => ({
        title: `Day ${i + 25} - CSS Styling and Layouts (Part ${i + 1})`,
        description: `Topics in CSS3: Flexbox, Grid, Custom Properties, Transitions, and Animations (session ${i + 1}).`,
        tags: ["CSS3", "Responsive Design", "Flexbox"],
        watchUrl: `https://www.youtube.com/watch?v=day${i + 25}`,
        materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
        status: "Done"
      }))
    },
    {
      name: "BootStrap",
      totalModules: 8,
      completedModules: 8,
      status: "Completed",
      modules: Array.from({ length: 8 }, (_, i) => ({
        title: `Day ${i + 52} - Bootstrap Components (Part ${i + 1})`,
        description: `Rapid UI styling using Bootstrap 5 Grid system, Navigation, and Modals (session ${i + 1}).`,
        tags: ["Bootstrap", "CSS Frameworks", "Rapid Prototyping"],
        watchUrl: `https://www.youtube.com/watch?v=day${i + 52}`,
        materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
        status: "Done"
      }))
    },
    {
      name: "Git & Github",
      totalModules: 1,
      completedModules: 1,
      status: "Completed",
      modules: [
        {
          title: "Day 60 - Git Version Control & Github Hosting",
          description: "Understanding commits, branches, pull requests, merges and deployment with Github Pages.",
          tags: ["Git", "GitHub", "Version Control"],
          watchUrl: "https://www.youtube.com/watch?v=day60",
          materialUrl: "DotNet Full Stack Developer Course - 90 Days PPT.pdf",
          status: "Done"
        }
      ]
    }
  ]
};

async function seedDatabase() {
  try {
    console.log("Starting database seeding process...");
    
    // List existing courses and clear duplicate Dot Net courses to avoid cluttering Firestore
    const coursesCollection = collection(db, "courses");
    const querySnapshot = await getDocs(coursesCollection);
    
    console.log("Checking for existing default course...");
    for (const docSnapshot of querySnapshot.docs) {
      if (docSnapshot.data().title === defaultCourse.title) {
        console.log(`Removing old course document with ID: ${docSnapshot.id}`);
        await deleteDoc(doc(db, "courses", docSnapshot.id));
      }
    }

    console.log("Writing new course document...");
    const docRef = await addDoc(coursesCollection, defaultCourse);
    console.log(`Successfully seeded database with Course ID: ${docRef.id}`);
    
    console.log("Seeding finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database: ", error);
    process.exit(1);
  }
}

seedDatabase();
