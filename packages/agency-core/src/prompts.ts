export const SOLUTION_BRIEF_PROMPT = `
You are an expert AI automation consultant. Given the client configuration JSON below, produce a concise solution brief (2-4 paragraphs) that outlines the recommended systems, architecture, and high-level benefits.

ClientConfig:
{{CLIENT_CONFIG}}

Deliverable:
- One-sentence summary
- Key systems to implement (bulleted)
- Estimated phases (high-level)
`;

export const PHASE_PROPOSAL_PROMPT = (phase: number) => `
You are a proposal writer. Using the ClientConfig below, write a Phase ${phase} proposal that includes objectives, key deliverables, acceptance criteria, and an estimated timeline.

ClientConfig:
{{CLIENT_CONFIG}}

Phase: ${phase}

Deliverable:
- Objectives
- Deliverables
- Acceptance Criteria
- Timeline (high-level)
`;

export const TEMPLATES = {
  solutionBrief: SOLUTION_BRIEF_PROMPT,
  phase1: PHASE_PROPOSAL_PROMPT(1),
  phase2: PHASE_PROPOSAL_PROMPT(2),
  phase3: PHASE_PROPOSAL_PROMPT(3),
};
