export interface Software {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  repoUrl: string;
  demoUrl?: string;
  documentationUrl?: string;
  technologies: string[];
  developers: string[];
  license: string;
  projectIds?: string[]; // Changed from projectId to projectIds array
  projectId?: string; // Keep for backward compatibility
  featured?: boolean;
  releaseDate?: string;
  lastUpdate?: string;
  publicationIds?: string[]; // Added support for related publications
}

export const software: Software[] = [
  {
    "id": "brain-mapper",
    "name": "AutoRA: Automated Research Assistant for closed-loop empirical research.",
    "description": "Automated Research Assistant (autora) is a Python package for automating and integrating empirical research processes, such as experimental design, data collection, and model discovery. With this package, users can define an empirical research problem and specify the methods they want to employ for solving it. autora is designed as a declarative language in that it provides a vocabulary and set of abstractions to describe and execute scientific processes and to integrate them into a closed-loop system for scientific discovery. The package interfaces with other tools for automating scientific practices, such as scikit-learn for model discovery, sweetpea and sweetbean for experimental design, firebase_admin for executing web-based experiments, and autodoc for documenting the empirical research process. While initially developed for the behavioral sciences, autora is designed as a general framework for closed-loop scientific discovery, with applications in other empirical disciplines. ",
    "repoUrl": "https://github.com/automated-lab/brain-mapper",
    "technologies": [
      "Python",
      "Google Firebase",
      "Google Firestore",
      "Prolific",
      "web experiments"
    ],
    "developers": [
      "Sebastian Musslick"
    ],
    "license": "MIT",
    "imageUrl": "https://autoresearch.github.io/autora/img/overview.png",
    "demoUrl": "https://autoresearch.github.io/autora/examples/closed-loop-basic/",
    "documentationUrl": "https://autoresearch.github.io/autora/",
    "projectIds": [
      "project-1744367667570",
      "project-1744380957652",
      "project-1744383288085"
    ],
    "projectId": "project-1744367667570",
    "publicationIds": [
      "pub-1744708691267"
    ],
    "featured": true,
    "releaseDate": "2022-08-26"
  },
  {
    "id": "cogni-sim",
    "name": "SweetBean: ​A declarative language for behavioral experiments with human and artificial participants.",
    "description": "SweetBean is an open-source, domain-specific declarative programming language built in Python, designed to simplify the synthesis of web-based behavioral experiments. It allows researchers to specify a behavioral experiment in declarative form as a sequence of events. Once specified, SweetBean can compile the experiment into a jsPsych experiment for web-based behavioral study with human participants. In addition, ​SweetBean can generate prompts for conducting the same experiment with a large language model (LLM), enabling automated alignment of LLMs with human behavior.\n\nThe SweetBean package integrates with other tools that automate aspects of behavioral research, such as SweetPea for automating experimental design, or AutoRA for orchestrating closed-loop behavioral research studies. Together, these tools form an ecosystem for advancing behavioral research through automated scientific discovery.",
    "repoUrl": "https://github.com/automated-lab/cogni-sim",
    "technologies": [
      "Python",
      "JavaScript",
      "web experiments"
    ],
    "developers": [
      "Sebastian Musslick"
    ],
    "license": "MIT",
    "demoUrl": "https:/https://autoresearch.github.io/sweetbean/Basic%20Tutorials//demos.automated-lab.org/cognisim",
    "documentationUrl": "https://autoresearch.github.io/sweetbean/",
    "projectIds": [
      "project-1744383288085",
      "project-1744383465177"
    ],
    "projectId": "project-1744383288085",
    "releaseDate": "2024-12-10"
  },
  {
    "id": "neuro-bci",
    "name": "SweetPea: A declarative language for factorial experimental design.",
    "description": "Experimental design is a key ingredient of reproducible empirical research. Yet, given the increasing complexity of experimental designs, researchers often struggle to implement ones that allow them to measure their variables of interest without confounds. SweetPea is an open-source declarative language in Python, in which researchers can describe their desired experiment as a set of factors and constraints. The language leverages advances in areas of computer science to sample experiment sequences in an unbiased way. SweetPea is a standalone package. However, the Autonomous Empirical Research Group leverages SweetPea to automate the design of novel experiments.",
    "repoUrl": "https://github.com/automated-lab/neuro-bci",
    "technologies": [
      "Python"
    ],
    "developers": [
      "Sebastian Musslick"
    ],
    "license": "MIT",
    "demoUrl": "https://sites.google.com/view/sweetpea-ai/tutorials",
    "documentationUrl": "https://sweetpea-org.github.io/",
    "projectIds": [
      "project-1744380957652",
      "project-1744383288085"
    ],
    "projectId": "project-1744380957652",
    "releaseDate": "2018-09-20",
    "publicationIds": []
  },
  {
    "id": "software-1744661083211",
    "name": "EEG-GAN",
    "description": "EEG-GAN is a data augmentation tool for electroencephalography (EEG). It leverages a Generative Adversarial Network (GAN) to obtain trial-level synthetic EEG samples from naturalistic samples that are conditioned on experimental manipulations. The resulting samples can be used to enhance the classification of EEG-Data with any classifier.",
    "repoUrl": "https://github.com/AutoResearch/EEG-GAN",
    "technologies": [
      "Python",
      "EEG"
    ],
    "developers": [
      "Sebastian Musslick",
      "Daniel Weinhardt"
    ],
    "license": "MIT",
    "documentationUrl": "https://autoresearch.github.io/EEG-GAN/",
    "releaseDate": "2023-03-28"
  },
  {
    "id": "software-1745315215124",
    "name": "Mentevo",
    "description": "Mentevo is a compact Python library for simulating and analyzing a dynamical system model of cognitive stability and flexibility in task-switching environments, within groups of agents. Originally developed for the study presented in Brondetta et al. (2024), it provides tools to explore how environmental and task conditions (e.g., task-switching rates) affect individual and group task-switching performance. The library also includes parametrization options, performance metrics and visualization methods.",
    "repoUrl": "https://github.com/alessandrabrondetta/Mentevo",
    "technologies": [
      "dynamical system",
      "computational modeling"
    ],
    "developers": [
      "Alessandra Brondetta"
    ],
    "license": "MIT",
    "imageUrl": "https://alessandrabrondetta.github.io/Mentevo/assets/banner.png",
    "demoUrl": "https://github.com/alessandrabrondetta/Mentevo/blob/main/notebooks/starter.ipynb",
    "documentationUrl": "https://alessandrabrondetta.github.io/Mentevo/",
    "projectIds": [
      "project-1744537991200",
      "project-1744383751212"
    ],
    "projectId": "project-1744537991200",
    "publicationIds": [
      "pub-1744728564846"
    ],
    "releaseDate": "2025-01-20"
  }
];
