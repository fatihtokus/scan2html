export const data = [
  {
    Target: "Dockerfile",
    Class: "config",
    Type: "dockerfile",
    MisconfSummary: {
      Successes: 22,
      Failures: 2,
      Exceptions: 0,
    },
    Misconfigurations: [
      {
        Type: "Dockerfile Security Check",
        ID: "DS002",
        AVDID: "AVD-DS-0002",
        Title: "Image user should not be 'root'",
        Description:
          "Running containers with 'root' user can lead to a container escape situation. It is a best practice to run containers as non-root users, which can be done by adding a 'USER' statement to the Dockerfile.",
        Message:
          "Specify at least 1 USER command in Dockerfile with non-root user as argument",
        Namespace: "builtin.dockerfile.DS002",
        Query: "data.builtin.dockerfile.DS002.deny",
        Resolution:
          "Add 'USER \u003cnon root user name\u003e' line to the Dockerfile",
        Severity: "HIGH",
        PrimaryURL: "https://avd.aquasec.com/misconfig/ds002",
        References: [
          "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/",
          "https://avd.aquasec.com/misconfig/ds002",
        ],
        Status: "FAIL",
        Layer: {},
        CauseMetadata: {
          Provider: "Dockerfile",
          Service: "general",
          Code: {
            Lines: null,
          },
        },
      },
      {
        Type: "Dockerfile Security Check",
        ID: "DS026",
        AVDID: "AVD-DS-0026",
        Title: "No HEALTHCHECK defined",
        Description:
          "You shoud add HEALTHCHECK instruction in your docker container images to perform the health check on running containers.",
        Message: "Add HEALTHCHECK instruction in your Dockerfile",
        Namespace: "builtin.dockerfile.DS026",
        Query: "data.builtin.dockerfile.DS026.deny",
        Resolution: "Add HEALTHCHECK instruction in Dockerfile",
        Severity: "LOW",
        PrimaryURL: "https://avd.aquasec.com/misconfig/ds026",
        References: [
          "https://blog.aquasec.com/docker-security-best-practices",
          "https://avd.aquasec.com/misconfig/ds026",
        ],
        Status: "FAIL",
        Layer: {},
        CauseMetadata: {
          Provider: "Dockerfile",
          Service: "general",
          Code: {
            Lines: null,
          },
        },
      },
    ],
  },
  {
    Target: "Dockerfile.canary",
    Class: "config",
    Type: "dockerfile",
    MisconfSummary: {
      Successes: 22,
      Failures: 2,
      Exceptions: 0,
    },
    Misconfigurations: [
      {
        Type: "Dockerfile Security Check",
        ID: "DS002",
        AVDID: "AVD-DS-0002",
        Title: "Image user should not be 'root'",
        Description:
          "Running containers with 'root' user can lead to a container escape situation. It is a best practice to run containers as non-root users, which can be done by adding a 'USER' statement to the Dockerfile.",
        Message:
          "Specify at least 1 USER command in Dockerfile with non-root user as argument",
        Namespace: "builtin.dockerfile.DS002",
        Query: "data.builtin.dockerfile.DS002.deny",
        Resolution:
          "Add 'USER \u003cnon root user name\u003e' line to the Dockerfile",
        Severity: "HIGH",
        PrimaryURL: "https://avd.aquasec.com/misconfig/ds002",
        References: [
          "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/",
          "https://avd.aquasec.com/misconfig/ds002",
        ],
        Status: "FAIL",
        Layer: {},
        CauseMetadata: {
          Provider: "Dockerfile",
          Service: "general",
          Code: {
            Lines: null,
          },
        },
      },
      {
        Type: "Dockerfile Security Check",
        ID: "DS026",
        AVDID: "AVD-DS-0026",
        Title: "No HEALTHCHECK defined",
        Description:
          "You shoud add HEALTHCHECK instruction in your docker container images to perform the health check on running containers.",
        Message: "Add HEALTHCHECK instruction in your Dockerfile",
        Namespace: "builtin.dockerfile.DS026",
        Query: "data.builtin.dockerfile.DS026.deny",
        Resolution: "Add HEALTHCHECK instruction in Dockerfile",
        Severity: "LOW",
        PrimaryURL: "https://avd.aquasec.com/misconfig/ds026",
        References: [
          "https://blog.aquasec.com/docker-security-best-practices",
          "https://avd.aquasec.com/misconfig/ds026",
        ],
        Status: "FAIL",
        Layer: {},
        CauseMetadata: {
          Provider: "Dockerfile",
          Service: "general",
          Code: {
            Lines: null,
          },
        },
      },
    ],
  },
  {
    Target: "Dockerfile.protoc",
    Class: "config",
    Type: "dockerfile",
    MisconfSummary: {
      Successes: 22,
      Failures: 2,
      Exceptions: 0,
    },
    Misconfigurations: [
      {
        Type: "Dockerfile Security Check",
        ID: "DS002",
        AVDID: "AVD-DS-0002",
        Title: "Image user should not be 'root'",
        Description:
          "Running containers with 'root' user can lead to a container escape situation. It is a best practice to run containers as non-root users, which can be done by adding a 'USER' statement to the Dockerfile.",
        Message:
          "Specify at least 1 USER command in Dockerfile with non-root user as argument",
        Namespace: "builtin.dockerfile.DS002",
        Query: "data.builtin.dockerfile.DS002.deny",
        Resolution:
          "Add 'USER \u003cnon root user name\u003e' line to the Dockerfile",
        Severity: "HIGH",
        PrimaryURL: "https://avd.aquasec.com/misconfig/ds002",
        References: [
          "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/",
          "https://avd.aquasec.com/misconfig/ds002",
        ],
        Status: "FAIL",
        Layer: {},
        CauseMetadata: {
          Provider: "Dockerfile",
          Service: "general",
          Code: {
            Lines: null,
          },
        },
      },
      {
        Type: "Dockerfile Security Check",
        ID: "DS026",
        AVDID: "AVD-DS-0026",
        Title: "No HEALTHCHECK defined",
        Description:
          "You shoud add HEALTHCHECK instruction in your docker container images to perform the health check on running containers.",
        Message: "Add HEALTHCHECK instruction in your Dockerfile",
        Namespace: "builtin.dockerfile.DS026",
        Query: "data.builtin.dockerfile.DS026.deny",
        Resolution: "Add HEALTHCHECK instruction in Dockerfile",
        Severity: "LOW",
        PrimaryURL: "https://avd.aquasec.com/misconfig/ds026",
        References: [
          "https://blog.aquasec.com/docker-security-best-practices",
          "https://avd.aquasec.com/misconfig/ds026",
        ],
        Status: "FAIL",
        Layer: {},
        CauseMetadata: {
          Provider: "Dockerfile",
          Service: "general",
          Code: {
            Lines: null,
          },
        },
      },
    ],
  },
];
