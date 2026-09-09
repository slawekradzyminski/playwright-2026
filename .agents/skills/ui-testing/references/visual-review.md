# Visual review and regression scope

Screenshots are exploration evidence. This workflow does not add screenshot baselines, pixel comparisons or `toHaveScreenshot` assertions. If visual regression automation is explicitly requested, establish its separate scope and baseline policy first.

## Visual review before assigning a result

Review appearance separately from interaction results. A successful click or passing functional test does not establish that the control or surrounding layout looks correct. For each image, make two passes: first inspect the overall composition and boundaries between regions, then compare related controls and text within each region.

Use the applicable checks below and record concrete observations; do not mechanically mark every item as passed.

| Area | Required comparison |
| --- | --- |
| Related controls | Compare label alignment, left/right insets, icon placement, widths and spacing within each group. Investigate an outlier such as centered Logout among left-aligned account links; different HTML element types do not explain away a visible inconsistency. |
| Content containment | Inspect text and icons inside cards and panels, including their right and bottom edges. No document-level horizontal overflow does not rule out content clipped by an ancestor. Measure the affected container when clipping is suspected. |
| Menus, dialogs and sticky elements | Compare closed and open states at the same viewport and scroll position. Inspect the boundary with background content: partially hidden headings, text appearing to continue the menu, overlapping actions and unclear grouping. For sticky navigation on a long page, check opening near the top and near the footer. |
| Intent and evidence | Distinguish what is visibly different from why it happens and whether it is intended. Use requirements, neighboring controls and browser measurements as evidence. Source classes suggest intent or cause but do not prove deployed behavior. Intentional overlays can obscure content; do not automatically classify every overlap as a defect. |

If a detail looks suspicious, investigate it before assigning “No concern observed.” If intent remains unclear, record “Needs clarification” and a suspected bug with the specific uncertainty; do not silently dismiss it as subjective. Ask only about the unresolved detail and continue independent work.

For each image, first write a concise, evidence-based observation of what was actually inspected, then assign the review result. Present the observation before the result in the report; do not start with “No concern observed” and add a justification afterward. Describe visible facts and relevant measurements, not private internal reasoning. For example: “Account labels share the same left edge; menu/footer boundary remains clear in the open state.” Generic phrases such as “looks fine” or “consistent spacing” without naming the inspected region are insufficient. Do not prefill positive results across the screenshot list. Functional outcomes belong in the scenario results, not as justification for visual approval.

Before completing the review, revisit screenshots containing open menus/dialogs, feedback overlays or suspected clipping. Check that every observed anomaly has either a bug reference, an explicit unresolved question, or evidence explaining why it is not a defect. Keep uninspected areas and untested states as coverage gaps; do not imply they passed.
