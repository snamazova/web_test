import { LAB_COLOR } from '../utils/colorUtils';

// Define the Project interface to match the dashboard data structure
export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  category: string | string[]; // Supports both single string and array
  team: string[];
  topics?: string[];
  topicsWithColors?: { name: string; color: string; hue: number }[]; // Re-add topicsWithColors
  publications?: string[];
  image?: string;
  emojiHexcodes?: string[]; // Changed from emojiHexcode (singular) to emojiHexcodes (array)
  status?: 'ongoing' | 'completed';
  startDate?: string;
  endDate?: string;
  _lastUpdated?: number;
}

// Define project data with the structure matching the dashboard
export const projects: Project[] = [
  {
    "id": "project-1744367667570",
    "title": "Automated Model Discovery",
    "description": "Developing mechanistic models that explain behavioral and neural phenomena is a fundamental staple of cognitive science. However, as researchers collect increasingly large and complex datasets, they often lack the time, resources, or methodological tools to integrate this data into interpretable models. Moreover, the space of possible computational models is vast—far exceeding what human intuition alone can efficiently navigate.\n\nOur lab addresses this challenge by developing AI-driven methods for automated model discovery. We use techniques such as sparse identification of nonlinear dynamical systems (SINDy) and symbolic regression to extract interpretable models from noisy behavioral and neural data. These methods allow us to uncover latent cognitive dynamics underlying processes like reinforcement learning and decision-making, providing concise, human-understandable explanations of complex behavioral patterns.",
    "category": [
      "AI for science",
      "reinforcement learning",
      "decision making",
      "cognitive control"
    ],
    "team": [
      "Sebastian Musslick",
      "Sedighe Raeisi",
      "Daniel Weinhardt",
      "Muhip Tezcan",
      "Se Eun Choi"
    ],
    "color": "linear-gradient(to right, #00AAFF 0%, #005580 100%)",
    "topics": [
      "equation discovery",
      "knowledge distillation",
      "SINDy",
      "computational modeling"
    ],
    "topicsWithColors": [
      {
        "name": "equation discovery",
        "color": "#f0a8a8",
        "hue": 0
      },
      {
        "name": "knowledge distillation",
        "color": "#a8f0a8",
        "hue": 120
      },
      {
        "name": "SINDy",
        "color": "#a8a8f0",
        "hue": 240
      },
      {
        "name": "computational modeling",
        "color": "#f0baa8",
        "hue": 15
      }
    ],
    "status": "ongoing",
    "publications": [
      "pub-005",
      "pub-1744722944290",
      "pub-1744891086200"
    ],
    "emojiHexcodes": [
      "1F4C8",
      "1F916"
    ],
    "image": "https://i.postimg.cc/cCm37nc5/model-discovery.png",
    "startDate": "2023-10-01",
    "_lastUpdated": 1744902884665
  },
  {
    "id": "project-1744380957652",
    "title": "Automated Experimental Design",
    "description": "A central challenge in empirical research is selecting experiments that yield scientific merit. This involves identifying not only promising experimental conditions within a predefined design space, but also discovering entirely new experimental variables that expand that space. As design spaces grow in complexity and dimensionality, navigating them effectively becomes increasingly difficult—especially when trying to isolate conditions that maximize informativeness while minimizing the impact of nuisance variables.\n\nOur lab develops AI-driven tools to address this challenge. We apply methods from active learning and optimal experimental design to efficiently search complex spaces of experiments. To ensure experimental control, we also use techniques from Boolean satisfiability sampling to automate the counterbalancing of stimulus sequences and minimize confounding effects.\n\nBeyond individual experiments, our approach aims to address a deeper issue in cognitive science: empirical fragmentation. Experimental paradigms are often designed in isolation for narrow questions, limiting the ability to compare results across studies or integrate theoretical insights. By sampling from broader, high-dimensional design spaces, we aim to unify previously disjointed paradigms—enabling a more integrative understanding of human cognition.",
    "category": [
      "AI for science",
      "cognitive control"
    ],
    "team": [
      "Sebastian Musslick",
      "Sedighe Raeisi",
      "Pelin Kömürlüoğlu",
      "Se Eun Choi"
    ],
    "color": "linear-gradient(to right, #00AAFF 0%, #005580 100%)",
    "topics": [
      "active learning",
      "SAT sampling",
      "program synthesis",
      "integrative experimental design"
    ],
    "topicsWithColors": [
      {
        "name": "active learning",
        "color": "#f0a8a8",
        "hue": 0
      },
      {
        "name": "SAT sampling",
        "color": "#ccf0a8",
        "hue": 90
      },
      {
        "name": "program synthesis",
        "color": "#a8f0f0",
        "hue": 180
      },
      {
        "name": "integrative experimental design",
        "color": "#cca8f0",
        "hue": 270
      }
    ],
    "status": "ongoing",
    "publications": [
      "pub-1744721577387"
    ],
    "emojiHexcodes": [
      "1F52C",
      "1F916"
    ],
    "image": "https://i.postimg.cc/0NyP1hcn/experimental-design.png",
    "startDate": "2023-10-01",
    "_lastUpdated": 1744902569877
  },
  {
    "id": "project-1744383288085",
    "title": "Automated Laboratories for Integrated Scientific Discovery",
    "description": "Scientific discovery is a complex, multi-step process—spanning literature review, hypothesis generation, experimental design, data collection, analysis, and model building. In addition, scientific discovery often occurs interactively across multiple levels, ranging from the discovery of high-level taxonomies to the discovery of detailed process models. While recent advances in AI for science have made progress in automating individual steps of empirical research, these efforts typically focus on tasks in isolation, without connecting them into a unified workflow, and across levels of scientific knowledge. Our lab seeks to go beyond such task-specific automation by developing fully integrated, closed-loop systems in which AI agents collaborate across all stages of the scientific process. These systems aim to autonomously generate, test, and refine hypotheses—accelerating discovery and enabling scientific reasoning at a scale and depth that manual approaches alone cannot achieve.\n\nTo realize this vision, we develop specialized AI agents capable of performing key scientific tasks—such as literature search, experimental design, data analysis, and model building. Each agent is designed to operate both independently and in concert with others, enabling dynamic interaction across stages of the research process. A central challenge in this work is the development of shared, structured representations of scientific knowledge that allow these agents to reason collectively and update their understanding as new insights emerge.\n\nBy coordinating these agents within integrated systems, we aim to build autonomous laboratories capable of conducting full cycles of scientific inquiry—from identifying open questions in the literature to designing informative experiments, analyzing results, and refining theoretical models. We apply these systems to the discovery of hypotheses, mechanisms and theories underlying different aspects human cognition. In doing so, we hope to overcome traditional bottlenecks in empirical research and lay the groundwork for a an understanding of human cognition across different levels of explanation.",
    "category": [
      "AI for science",
      "reinforcement learning",
      "machine learning"
    ],
    "team": [
      "Sebastian Musslick",
      "Sedighe Raeisi",
      "Daniel Weinhardt",
      "Moritz Hartstang",
      "Se Eun Choi",
      "Leon Schmid"
    ],
    "color": "linear-gradient(to right, #00AAFF 0%, #005580 100%)",
    "topics": [
      "integrative experimental design",
      "program synthesis",
      "active learning",
      "equation discovery",
      "computational modeling",
      "scientific knowledge representation",
      "retrieval augmented generation"
    ],
    "topicsWithColors": [
      {
        "name": "integrative experimental design",
        "color": "#cca8f0",
        "hue": 270
      },
      {
        "name": "program synthesis",
        "color": "#a8f0f0",
        "hue": 180
      },
      {
        "name": "active learning",
        "color": "#f0a8a8",
        "hue": 0
      },
      {
        "name": "equation discovery",
        "color": "#f0a8a8",
        "hue": 0
      },
      {
        "name": "computational modeling",
        "color": "#f0baa8",
        "hue": 15
      },
      {
        "name": "scientific knowledge representation",
        "color": "#f0e6a8",
        "hue": 52
      },
      {
        "name": "retrieval augmented generation",
        "color": "#f0a8e5",
        "hue": 309
      }
    ],
    "status": "ongoing",
    "publications": [
      "pub-001",
      "pub-1744708691267",
      "pub-1744719753012"
    ],
    "emojiHexcodes": [
      "1F4C8",
      "1F916",
      "1F52C"
    ],
    "image": "https://i.postimg.cc/02TXR40S/integrated-discovery.png",
    "_lastUpdated": 1744903251954
  },
  {
    "id": "project-1744383465177",
    "title": "Human Participant Simulators for Experiment Prototyping",
    "description": "A major bottleneck in the study of human behavior is the cost and time required to collect behavioral data from human participants. These constraints force researchers to focus on a narrow set of experimental designs, limiting the scope of scientific exploration and slowing theory development. In other scientific fields—such as physics and chemistry—this challenge has been addressed through high-fidelity simulators. For example, AlphaFold has transformed chemistry by enabling researchers to simulate protein folding, accelerating discovery by allowing in silico experimentation.\n\nIn this research area, we explore how similar simulation-based approaches can benefit cognitive science. Specifically, we investigate how large language models can serve as simulators of human participants, providing plausible, human-like responses in behavioral tasks. These simulated participants allow us to rapidly prototype and evaluate experimental designs, test hypotheses, and explore broader regions of the experimental space before collecting real-world data—bringing the benefits of simulation-driven science to the study of the mind.",
    "category": [
      "AI for science",
      "decision making",
      "cognitive control",
      "reinforcement learning"
    ],
    "team": [
      "Sebastian Musslick",
      "Alessandra Brondetta",
      "Moritz Hartstang"
    ],
    "color": "linear-gradient(to right, #00AAFF 0%, #005580 100%)",
    "topics": [
      "integrative experimental design",
      "large language models",
      "computational modeling"
    ],
    "topicsWithColors": [
      {
        "name": "integrative experimental design",
        "color": "#cca8f0",
        "hue": 270
      },
      {
        "name": "large language models",
        "color": "#f0a8c8",
        "hue": 333
      },
      {
        "name": "computational modeling",
        "color": "#f0baa8",
        "hue": 15
      }
    ],
    "status": "ongoing",
    "publications": [
      "pub-003"
    ],
    "emojiHexcodes": [
      "1F4BB",
      "1F916"
    ],
    "image": "https://i.postimg.cc/NfxbJF9S/synthetic-participants.png",
    "startDate": "2023-10-01",
    "_lastUpdated": 1744902962907
  },
  {
    "id": "project-1744537991200",
    "title": "Rational Boundedness of Cognition",
    "description": "All forms of cognition—whether biological or artificial—are constrained by the architecture that supports them. No brain or machine can perform an infinite number of computations in parallel, and these fundamental limitations shape the way intelligent systems perceive, decide, and act. This idea is central to general theories of cognition, such as bounded rationality and bounded optimality. Yet, there remains little consensus on what exactly these cognitive bounds are—and more importantly, why they exist in the first place.\n\nIn this research area, we investigate the origins of cognitive constraints by drawing on insights from neuroscience, psychology, and machine learning. We focus on identifying fundamental computational dilemmas that arise in neural processing systems—for example, the tradeoff between sharing neural representations to support efficient learning and separating them to enable interference-free parallel processing. These tradeoffs may explain why certain cognitive limitations, such as the difficulty of performing multiple tasks at once, appear to be deeply embedded in both biological neural systems, and the degree to which they may translate to artificial systems as well. \n\nBy studying the computational logic behind cognitive constraints (e.g., in multitasking, task switching, and cognitive fatigue), we aim to provide a principled, mechanistic account of why cognition is bounded—one that applies to both natural and artificial intelligence and helps unify our understanding of their shared limitations.",
    "category": [
      "cognitive control",
      "decision making",
      "machine learning"
    ],
    "team": [
      "Sebastian Musslick",
      "Alessandra Brondetta"
    ],
    "color": "linear-gradient(to right, #00AAFF 0%, #005580 100%)",
    "topics": [
      "computational modeling",
      "mathematical analysis"
    ],
    "topicsWithColors": [
      {
        "name": "computational modeling",
        "color": "#f0baa8",
        "hue": 15
      },
      {
        "name": "mathematical analysis",
        "color": "#a8f0f0",
        "hue": 180
      }
    ],
    "status": "ongoing",
    "publications": [
      "pub-1744728564846",
      "pub-1744736607819",
      "pub-1744896020699"
    ],
    "emojiHexcodes": [
      "1F9E0",
      "2696"
    ],
    "image": "https://i.postimg.cc/XqK1rBhc/rational-boundedness.png",
    "startDate": "2023-10-01",
    "_lastUpdated": 1744903078480
  },
  {
    "id": "project-1744383751212",
    "title": "Cognitive Control & Mental Effort",
    "description": "Why does thinking hard feel so tiring? Even a day spent sitting at a desk can leave us feeling mentally exhausted. This sense of mental effort is deeply connected to the concept of cognitive control –– our brain’s ability to stay focused and adapt behavior in a changing world. It’s what helps us stay on task, resist distractions, and solve problems, and it plays a central role in everything from attention and memory to learning and decision-making. But surprisingly, we still don’t fully understand how mental effort works. Why does it feel effortful? Why do we sometimes lose focus, even when we’re trying hard? And how do we decide when it’s worth putting in the mental effort at all?\n\nIn our lab, we study these questions by combining large-scale behavioral experiments with computational modeling and automated scientific discovery. Our goal is to uncover the reasons for why humans are limited in their ability to exert cognitive control, why allocating control feels effortful, and how people decide how to allocate cognitive control.",
    "category": [
      "cognitive control",
      "decision making"
    ],
    "team": [
      "Sebastian Musslick",
      "Alessandra Brondetta",
      "Moritz Hartstang"
    ],
    "color": "linear-gradient(to right, #00AAFF 0%, #005580 100%)",
    "topics": [
      "computational modeling",
      "integrative experimental design"
    ],
    "topicsWithColors": [
      {
        "name": "computational modeling",
        "color": "#f0baa8",
        "hue": 15
      },
      {
        "name": "integrative experimental design",
        "color": "#cca8f0",
        "hue": 270
      }
    ],
    "status": "ongoing",
    "publications": [
      "pub-1744716563446",
      "pub-1744719584837",
      "pub-1744719929858",
      "pub-1744736825251",
      "pub-1744896816957"
    ],
    "emojiHexcodes": [
      "1F914",
      "1F9E0"
    ],
    "image": "https://i.postimg.cc/bYW5nczG/mental-effort.png",
    "startDate": "2023-10-01",
    "_lastUpdated": 1744903153667
  }
];
