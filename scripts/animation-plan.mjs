// Targets address original top-level SVG children; :N selects an absolute-M subpath.
// + groups connected artwork so all selected shapes share one transform origin.
const rows = `
accessibility|welcome|Arms lift gently in welcome.|arms,1:0,lift
achievement|trophy-glint|Cup handles brighten in sequence.|handle-left,0:1,pulse-a;handle-right,0:2,pulse-b
ai-coach|ai-spark|Coaching sparkle softly reveals.|spark,2,pulse
ai-cover-letter|envelope-open|Envelope flap opens, then the AI sparkle reveals.|envelope-flap,0:1,flap;spark,1,pulse-b
ai-interviewer|ai-spark|Interviewer sparkle softly reveals.|spark,1,pulse
ai-match-score|score-spark|Score needle ticks, then the AI sparkle reveals.|needle,0:1,tick;spark,1,pulse-b
ai-rewrite|rewrite-lines|Text lines redraw after the AI sparkle.|spark,2,pulse-a;lines,3,draw
ai-suggestion|idea-spark|Suggestion sparkle softly reveals beside the bulb.|spark,1,pulse
alumni-network|network-sequence|Alumni connection marks brighten from left to right.|node-left,1:0,pulse-a;node-middle,1:1,pulse-b;node-right,1:2,pulse-c
application-notes|note-write|The note text draws in.|note-lines,3:1,draw
application-sent|sent-check|The sent confirmation check draws on.|check,1,draw
application-status|status-sequence|Status rows brighten in sequence.|status-first,3:0,pulse-a;status-second,3:1,pulse-b;status-third,3:2,pulse-c
application-tracker|pipeline-sequence|Tracker cards brighten across the columns.|card-first,2:0,pulse-a;card-second,2:1,pulse-b;card-third,2:2,pulse-c
application-viewed|eye-sweep|The pupil looks across the viewed message.|pupil,2,sweep
apply|plane-send|The paper plane lifts diagonally and returns.|plane,3,fly
apprenticeship|tool-tap|The hammer gently taps around its grip.|hammer,0,tap
ats-pass|draw-check|The shield check draws on.|check,3,draw
ats-reject|gentle-shake|The rejection cross gives a small horizontal shake.|cross,3,shake
ats-scan|scan-line|The scan line passes down the document and returns.|scan-line,2,scan
ats-score|score-tick|The score needle ticks around the gauge hub.|needle,2,tick
background-check|draw-check|The background verification check draws on.|check,3,draw
background-cleared|draw-check|The clearance check draws on inside the shield.|check,1,draw
behavioral-question|question-reveal|The question mark softly reveals.|question,2,pulse
benefits|gift-open|The gift lid lifts slightly and settles.|lid,1,lift
bonus|coin-drop|The coin and its plus settle downward together.|coin,0+1:3+1:4,drop
browser-autofill|autofill-sequence|Form rows draw in after the confirmation check.|check,1:3,draw;field-first,1:0,pulse-a;field-second,1:1,pulse-b;field-third,1:2,pulse-c
bullet-point|bullet-sequence|Bullets brighten down the list.|bullet-first,0,pulse-a;bullet-second,1,pulse-b;bullet-third,2,pulse-c
burnout|quiet-breath|The small inner mark dims and recovers gently.|ember,1,breathe
calendar-sync|sync-turn|The synchronization arrow turns slightly and returns.|sync-arrow,2,turn
career-break|pause-breathe|Pause bars soften and recover together.|pause-bars,2,breathe
career-change|branch-draw|The two career branches draw in sequence.|branch-left,0:0+0:1,draw;branch-right,0:2+0:3,draw-late
career-goal|target-focus|The target center softly brightens.|target-center,2,pulse
career-ladder|rung-rise|The middle rung rises slightly and settles.|rung,0:3,lift
career-milestone|milestone-reveal|The milestone marker softly reveals.|milestone,1,pulse
career-path|path-draw|The route and direction arrow draw on.|route,0,draw
case-interview|case-notes|Case-analysis lines draw in.|case-lines,2,draw
certificate|seal-reveal|The certificate seal and ribbons softly reveal.|seal,2+3,pulse
chrome-extension|none|No independent interior part can move without breaking the puzzle silhouette.|The single connected puzzle outline has no separate functional part.
coding-challenge|code-sequence|Code brackets brighten one after the other.|bracket-left,1:0,pulse-a;bracket-right,1:1,pulse-b
coffee-chat|steam-rise|Steam strokes lift in a short stagger.|steam-left,0:2,lift;steam-right,0:3,lift-late
cold-outreach|envelope-open|The outreach envelope flap opens and settles.|envelope-flap,0:1,flap
commute|wheel-tick|Wheel rims brighten in travel order.|wheel-left,1,pulse-a;wheel-right,2,pulse-b
company-research|magnifier-sweep|The magnifier sweeps over the company details.|magnifier,1+2,sweep
compare-offers|offer-compare|Offer detail rows brighten left then right.|offer-left,0:3,pulse-a;offer-right,0:4,pulse-b
contact-card|contact-reveal|Contact detail rows draw on.|contact-lines,2:1+2:2,draw
contract-job|signature-draw|The contract signature draws on.|signature,3,draw
cost-of-living|coin-drop|The cost coin and its mark settle together.|coin,1+2,drop
counter-offer|counter-exchange|Counter-offer arrows move in opposing directions.|arrow-right,1:0+1:1,right;arrow-left,1:2+1:3,left
cover-letter|envelope-open|The envelope flap opens slightly around its upper hinge.|envelope-flap,0:1,flap
cv-international|globe-draw|Globe meridians draw inside the static rim.|meridians,4,draw
deadline|sand-flow|Hourglass diagonals brighten in a falling sequence.|sand-first,2:2,pulse-a;sand-second,2:3,pulse-b
design-job|pen-write|The pen nib makes a small writing stroke.|pen,2,write
diversity|people-sequence|The three people brighten in sequence.|person-top,0,pulse-a;person-left,1,pulse-b;person-right,2,pulse-c
easy-apply|quick-flash|The quick-apply lightning mark softly flashes.|bolt,3,pulse
education-job|cap-lift|The graduation cap lifts gently and returns.|cap,2,lift
elevator-pitch|pitch-directions|Elevator direction arrows nudge in opposing vertical directions.|arrow-up,0:2,lift;arrow-down,0:3,down
email-template|template-draw|The template dividers draw inside the static panel.|dividers,1:1+1:2,draw
employment-gap|gap-focus|The gap markers soften and recover.|gap-marks,0:4+0:5+0:6,breathe
engineering-job|tool-turn|The engineering wrench turns gently around its grip.|wrench,2,tap
entry-level|step-rise|The entry arrow rises above the first steps.|arrow,1,lift
equal-pay|equal-reveal|The equality bars brighten together.|equal-bars,2:2+2:3,pulse
equity|share-draw|The equity division draws inside the static circle.|share-lines,1,draw
event-networking|network-sequence|Event connection nodes brighten in sequence.|node-first,2,pulse-a;node-second,3,pulse-b
executive-role|crown-lift|The executive crown lifts and settles.|crown,2,lift
exit-interview|exit-arrow|The exit arrow nudges toward the doorway.|arrow,1:1+1:2,right
feedback|rating-reveal|The feedback star softly reveals.|rating,1,pulse
final-round|finish-rise|The final-round flag rises and settles.|flag,1:0,lift
finance-job|growth-sequence|Finance bars brighten from short to tall.|bar-first,2:0,pulse-a;bar-second,2:1,pulse-b;bar-third,2:2,pulse-c
first-day|flag-wave|The first-day flag gives a small welcoming wave.|flag,2,flag
flexible-hours|clock-tick|The clock hands tick around their central pivot.|hands,1:0,tick
follow-up|follow-turn|The follow-up arrow turns gently and returns.|follow-arrow,1,turn
four-day-week|day-sequence|Four workday marks brighten in order.|day-first,1:3,pulse-a;day-second,1:4,pulse-b;day-third,1:5,pulse-c;day-fourth,1:6,pulse-d
freelance|pen-write|The pen nib makes a small writing stroke.|pen,0:1+0:2+1,write
full-time|clock-tick|The clock hands tick inside the static clock rim.|hands,3,tick
ghosted|none|Motion would obscure the intentionally dotted absence cue.|Animating its only dotted outline would reduce legibility and turn absence into activity.
gig-work|quick-flash|The gig lightning mark softly flashes.|bolt,2,pulse
government-job|column-sequence|Government columns brighten from left to right.|column-first,0:2,pulse-a;column-second,0:3,pulse-b;column-third,0:4,pulse-c;column-fourth,0:5,pulse-d
group-interview|people-sequence|The two interview participants brighten in turn.|person-left,0,pulse-a;person-right,1,pulse-b
health-insurance|care-reveal|The medical cross softly reveals inside the shield.|cross,1,pulse
healthcare-job|care-reveal|The healthcare cross softly reveals.|cross,2,pulse
hiring-pipeline|pipeline-flow|The pipeline connector draws toward the next stage.|connector,2:0,draw
hospitality-job|cloche-lift|The serving dome lifts slightly and settles.|cloche,0:1,lift
hybrid|office-sequence|Office windows brighten down the hybrid workplace.|window-first,2:0,pulse-a;window-second,2:1,pulse-b;window-third,2:2,pulse-c
internship|sprout-grow|The sprout lifts gently as a growth cue.|sprout,2,lift
interview-feedback|approval-lift|The feedback thumb lifts gently and returns.|thumb,1,lift
interview-notes|pen-write|The note-taking pen makes a small writing stroke.|pen,1,write
interview-prep|draw-check|Preparation checks draw on.|checks,2,draw
interview-questions|question-reveal|The interview question mark softly reveals.|question,1:1+1:2,pulse
interview-schedule|person-reveal|The scheduled participant softly reveals.|person,2+3,pulse
interview-timer|clock-tick|The timer hands tick around their hub.|hands,1:3,tick
interview|people-sequence|Interview participants brighten in conversational order.|person-left,0,pulse-a;person-right,1,pulse-b
introduction-request|intro-arrow|The introduction arrow nudges between the two people.|arrow,2:2+2:3,right
job-alert|bell-ring|The alert bell gives a restrained ring.|bell,2,ring
job-board-sync|sync-turn|The board synchronization arrow turns gently.|sync-arrow,1:0+1:1,turn
job-fair|booth-reveal|The job-fair briefcase softly reveals.|briefcase,1+2,pulse
job-filters|filter-pass|The filter bar passes downward and returns.|filter-bar,1,scan
job-match|match-reveal|The matching tag softly reveals.|match,2,pulse
job-offer|seal-reveal|The offer seal and ribbons softly reveal.|seal,1+2,pulse
job-post|post-reveal|The posted job card softly reveals.|post,1,pulse
job-search|magnifier-sweep|The magnifier sweeps across the job details.|magnifier,2+3,sweep
job-security|shield-reveal|The security shield softly reveals.|shield,2+3,pulse
job-tracker|tracker-draw|Job-tracker rows draw on.|lines,2,draw
keyword-match|tag-match|The second keyword tag nudges toward the first.|tag,2,left
laid-off|gentle-shake|Only the box gives a small, restrained shake.|box,0,shake
layoff-support|support-reveal|The support cross softly reveals above the steady hand.|support,1,pulse
leadership|crown-lift|The leadership crown lifts gently and settles.|crown,0:0,lift
learning|learning-spark|The learning sparkle softly reveals.|spark,1,pulse
linkedin-profile|profile-draw|Profile detail rows draw on.|lines,3,draw
manager|org-sequence|Management connections draw below the static top node.|connections,2:1+2:2+2:3,draw
marketing-job|announce-tilt|The megaphone tilts gently to announce.|megaphone,2,ring
mental-health|quiet-breath|The inner heart softly dims and recovers.|heart,1,breathe
mentor|guidance-arrow|The mentor guidance arrow nudges toward the learner.|arrow,2,left
metrics-impact|trend-draw|The impact trend and arrow draw above the bars.|trend,0:3+0:4,draw
mock-interview|practice-turn|The practice repeat arrow turns gently.|repeat-arrow,2,turn
negotiation|counter-exchange|Negotiation arrows nudge toward the conversation center.|arrow-left,0:0+0:1,right;arrow-right,0:2+0:3,left
network|network-sequence|Network nodes brighten in connection order.|node-top,0,pulse-a;node-left,1,pulse-b;node-right,2,pulse-c
new-role|role-spark|The new-role sparkle softly reveals.|spark,2,pulse
offer-accepted|handshake-settle|The handshake center makes a small settling nod.|handshake,2+3,down
offer-letter|offer-sign|The offer signature mark draws on.|signature,3,draw
office-badge|badge-reveal|The badge portrait softly reveals inside its frame.|portrait,2+3,pulse
on-site-office|window-sequence|Office window rows brighten in order.|window-first,0:2+0:3,pulse-a;window-second,0:4+0:5,pulse-b
onboarding|welcome-arrow|The welcome arrow nudges toward the new participant.|arrow,1,right
one-page-resume|summary-draw|Resume text draws inside the fixed single-page frame.|lines,2:0+2:1+2:2,draw
onsite-interview|person-reveal|The onsite interview participant softly reveals.|person,1+2,pulse
open-to-work|availability-reveal|The availability plus softly reveals inside its circle.|plus,3,pulse
org-chart|org-sequence|Organization nodes brighten from parent to children.|node-parent,0,pulse-a;node-left,1,pulse-b;node-right,2,pulse-c
paid-time-off|umbrella-sway|The leave umbrella gives a gentle sway.|umbrella,2,ring
panel-interview|people-sequence|Panel participants brighten from left to right.|person-left,0,pulse-a;person-middle,1,pulse-b;person-right,2,pulse-c
parental-leave|cradle-sway|The cradle gives a small, gentle rocking motion.|cradle,1:1+1:2,cradle
parse-error|error-focus|Only the broken parse line gives a restrained shake.|broken-line,2:0,shake
part-time|partial-clock|The partial clock arc draws on.|partial-clock,2,draw
pay-transparency|eye-sweep|The transparency pupil looks across the pay details.|pupil,3,sweep
performance-review|growth-sequence|Performance bars brighten from short to tall.|bar-first,3:0,pulse-a;bar-second,3:1,pulse-b
personal-brand|flag-wave|The personal-brand flag gives a small wave.|flag,2,flag
phone-screen|call-reveal|The caller portrait softly reveals inside the phone.|person,1+2,pulse
portfolio|work-highlight|The featured-work star softly reveals.|star,1,pulse
probation-period|sand-flow|The probation hourglass diagonals brighten in sequence.|sand-first,2:2,pulse-a;sand-second,2:3,pulse-b
promotion|promotion-rise|The promotion arrow rises above the static steps.|arrow,1,lift
quick-apply-batch|batch-flash|The batch-apply lightning mark softly flashes.|bolt,1,pulse
raise-request|raise-rise|The raise arrow lifts above the request message.|arrow,1,lift
recommendation|approval-lift|The recommendation thumb lifts and settles.|thumb,2,lift
recruiter|magnifier-sweep|The recruiter magnifier sweeps over the candidate.|magnifier,2+3,sweep
references|reference-reveal|The reference portrait softly reveals.|person,3+4:0,pulse
referral|referral-arrow|The referral arrow nudges toward the recipient.|arrow,4,right
rejection|gentle-shake|The rejection cross gives a restrained horizontal shake.|cross,1,shake
relocation-package|move-arrow|The package direction arrow nudges right.|arrow,1,right
relocation|move-arrow|The relocation arrow nudges beside the map pin.|arrow,2,right
remote-job|screen-reveal|The remote-work screen softly reveals.|screen,1,pulse
resignation|exit-arrow|The resignation arrow nudges through the static doorway.|arrow,3:1+3:2,right
reskilling|reskill-turn|The reskilling arrows turn gently around the center.|arrows,0,turn
resume-check|draw-check|The resume checkmark draws on.|check,4,draw
resume-compare|compare-sequence|Resume detail rows brighten left then right.|lines-left,0:3+0:5,pulse-a;lines-right,0:4+0:6,pulse-b
resume-download|download-arrow|The download arrow moves down and returns.|arrow,4,down
resume-edit|pen-write|The resume pencil makes a small writing stroke.|pen,4,write
resume-score|score-tick|The resume-score needle ticks around its hub.|needle,3:1,tick
resume-sections|section-draw|Section dividers draw inside the static document.|dividers,2,draw
resume-summary|summary-draw|Summary text draws in above the final line.|lines,2,draw
resume-tailor|scissor-trim|The upper scissor blade closes slightly and returns.|blade,2:1+3,snip
resume-template|template-draw|Template text draws inside the stacked pages.|lines,4,draw
resume-upload|upload-arrow|The upload arrow rises and returns.|arrow,4,lift
resume-version|version-turn|The version-history arrow turns gently.|history-arrow,3,turn
resume|resume-write|Resume text draws inside the static page.|lines,3,draw
retirement-plan|savings-drop|The savings coin settles toward the plan roof.|coin,1,drop
return-to-work|return-turn|The return arrow turns gently back toward work.|return-arrow,2,turn
salary-range|range-adjust|Salary handles slide slightly apart and return.|handle-left,2,left;handle-right,3,right
salary|coin-drop|The salary coin settles inside the static banknote.|coin,1,drop
sales-job|tag-sway|The sales tag and its hole sway together.|tag,2+3,ring
saved-job|saved-reveal|The saved job briefcase softly reveals.|briefcase,1+2,pulse
seasonal-job|leaf-sway|The seasonal leaf sways gently.|leaf,2,ring
seven-day-plan|day-sequence|Day marks brighten across the plan.|days-first,2:0+2:3,pulse-a;days-second,2:1+2:4+2:5,pulse-b;days-third,2:2+2:6,pulse-c
severance|transition-door|The severance doorway leaf moves slightly around its hinge.|door-leaf,2:1,door
shortlisted|flag-wave|The shortlist flag gives a small wave.|flag,1,flag
side-project|project-reveal|The new-project plus softly reveals.|plus,1,pulse
signing-bonus|sign-and-add|The signature nib writes, then the bonus plus reveals.|pen,2,write;plus,3:1+3:2,pulse-b
skill-gap|gap-focus|The missing-skill marks dim and recover.|gap-marks,0:3+0:4,breathe
skills|none|Moving its single connected puzzle contour would weaken the skills metaphor.|No independent part exists inside the connected puzzle silhouette.
star-method|none|Moving the single STAR outline would introduce a generic whole-icon effect.|The single closed star has no independent semantic sub-part.
start-date|start-arrow|The start arrow nudges forward from the calendar.|arrow,2,right
take-home-task|draw-check|The take-home completion check draws on.|check,2,draw
team-culture|care-breathe|The team heart softly dims and recovers.|heart,3,breathe
team-meeting|people-sequence|Meeting participants brighten in conversational order.|person-left,0,pulse-a;person-right,1,pulse-b
tech-job|signal-sequence|Chip contacts brighten in a short circuit sequence.|contacts-first,1:0+1:2+1:4+1:6,pulse-a;contacts-second,1:1+1:3+1:5+1:7,pulse-b
technical-interview|code-sequence|Technical code brackets brighten in order.|bracket-left,1:0,pulse-a;bracket-right,1:1,pulse-b
tell-me-about-yourself|speech-reveal|The personal introduction bubble softly reveals.|speech,2,pulse
temp-to-hire|hire-arrow|The hire progression arrow nudges toward the next stage.|arrow,2:3,right
thank-you-note|envelope-open|The envelope flap opens, then the thank-you heart reveals.|envelope-flap,0:1,flap;heart,1,pulse-b
total-compensation|total-flow|Compensation connectors draw toward the combined total.|connectors,1,draw
transcript|transcript-draw|Transcript lines draw inside the static page.|lines,2,draw
two-weeks-notice|notice-sequence|Notice rows brighten down the calendar.|row-first,2:0,pulse-a;row-second,2:1,pulse-b;row-third,2:2,pulse-c
unemployment-benefits|coin-drop|The benefit coin settles inside the steady card.|coin,2,drop
upskill|skill-rise|The upskill arrow rises beside the book.|arrow,1,lift
veteran-friendly|medal-reveal|The service medal softly reveals below its ribbon.|medal,1,pulse
video-interview|person-reveal|The video-call portrait softly reveals inside the screen.|person,2,pulse
visa-sponsorship|sponsor-reveal|The sponsorship house softly reveals beside the document.|house,3,pulse
volunteer|care-breathe|The volunteer heart softly dims and recovers.|heart,2,breathe
waiting-reply|sand-flow|The waiting hourglass diagonals brighten in sequence.|sand-first,1:2,pulse-a;sand-second,1:3,pulse-b
warn-notice|notice-reveal|The warning triangle softly reveals without shaking.|warning,2,pulse
withdraw-application|withdraw-arrow|The withdrawal arrow moves back from the application.|arrow,2:1+2:2,left
work-life-balance|balance-settle|The balance pans make a small opposing settling motion.|pan-left,0:3,down;pan-right,0:4,lift
work-permit|permit-reveal|The permitted-work briefcase softly reveals.|briefcase,3+4,pulse
`;

export const animationPlan = Object.fromEntries(
  rows
    .trim()
    .split("\n")
    .map((row) => {
      const [name, motion, description, spec] = row.split("|");
      return [
        name,
        {
          motion,
          description,
          ...(motion === "none"
            ? { reason: spec, parts: [] }
            : {
                parts: spec.split(";").map((entry) => {
                  const [part, target, effect] = entry.split(",");
                  return { part, target, effect };
                }),
              }),
        },
      ];
    }),
);
