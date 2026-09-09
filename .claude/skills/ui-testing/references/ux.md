## Required user experience review

For every explored feature, assess whether a user can discover the intended action, understand the current state, complete the task and recover from mistakes. Evaluate this separately from whether the implementation technically works. Use realistic journeys and edge cases, including long content, empty results and unexpected input, at the relevant viewport sizes.

| Area | Required questions and probes |
| --- | --- |
| Discoverability and hierarchy | Can users find primary actions, search and content without unnecessary scrolling or opening unrelated controls? Does secondary content, such as a long category list, push the main task out of view? |
| Input expectations | Try pasted input, surrounding spaces, mixed case and relevant punctuation. Compare behavior with field wording and user expectations; distinguish an established requirement from an assumption. |
| State and consistency | Are counts, selected filters, sorting, labels and enabled/disabled actions consistent with the displayed data? Is it clear why an action is unavailable? Check combinations, not only isolated controls. |
| Feedback and recovery | Is the result of an action clear and timely? Can users correct invalid input, clear filters, recover from empty/error states and retry safely? Do notifications hide the next action or disappear before they can be understood? |
| Navigation and effort | Check back navigation and state retention against the journey's needs. Look for avoidable repeated input, unnecessary steps, ambiguous click targets and actions with surprising side effects. |

When behavior seems wrong or unnecessarily difficult, reproduce it and record the user goal, exact action, observed friction, impact and expected alternative with its source. Do not dismiss a concern merely because it matches the implementation or no design specification exists. Report a confirmed defect directly. If intended behavior remains uncertain, create a suspected bug, mark “Needs clarification” and ask the user a focused question with relevant evidence. Use screenshots for visual concerns and action/result evidence for behavioral concerns. Continue independent work; defer only assertions whose expected result depends on the answer. Update the finding when the user clarifies the requirement.

Include separate accessibility and UX summaries in `review.md`: checks actually performed, states/viewports, concrete observations, evidence, bug references, unresolved questions and coverage gaps. Use the same evidence-first result labels as visual review, but keep scan results, manual accessibility checks and UX judgments distinct. Before completing exploration, ensure every suspicious accessibility or UX observation has a bug reference, an explicit question or evidence explaining why it is not a defect. Summarize material findings and incomplete checks in the task result.
