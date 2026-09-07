// ============================================================================
// M GAMES — PLAYER HANDBOOK GUIDES
// The written content behind every box on the handbook map: GUIDES[subjectId]
// is an array of three guides, one per level, each pitched at exactly what that
// level of the game asks for.
//
// Shape of one guide:
//   title     what this level covers, in a few words
//   intro     a paragraph setting up the level
//   sections  [{ heading, paras: [...], example: { q, steps: [...], a } }]
//   mistakes  the errors this level reliably produces
//   recap     the whole thing in a handful of lines
//   practice  [{ q, a }] — answers stay hidden until asked for
//
// A subject with no entry here still appears on the map; its guide pages simply
// say they have not been written yet.
// ============================================================================
const GUIDES = {

  // ---- Bronze · Addition ---------------------------------------------------
  addition: [
    {
      title: "Adding two-digit numbers",
      intro: "Every question at this level is the same shape: two numbers between 10 and 99, added together — 47 + 68, 23 + 45. One method handles all of them, and it rests on a single idea: a two-digit number is really two numbers stuck together.",
      sections: [
        {
          heading: "Place value is the whole trick",
          paras: [
            "47 is not a single lump. It is 4 tens and 7 ones — 40 + 7. Every two-digit number splits the same way.",
            "That matters because you can add the tens to the tens and the ones to the ones, separately, and then put the halves back together. Two easy sums instead of one hard one.",
          ],
          example: { q: "32 + 45", steps: ["Tens: 30 + 40 = 70.", "Ones: 2 + 5 = 7.", "Put them together: 70 + 7."], a: "77" },
        },
        {
          heading: "Stacking them in columns",
          paras: [
            "Writing one number above the other does the splitting for you, as long as you line them up by place value: ones above ones, tens above tens. Never line them up by their left edges.",
            "Then work right to left, ones column first. That order is not arbitrary — a ones column that comes to 10 or more spills into the tens, and you want to know that before you finish the tens.",
          ],
        },
        {
          heading: "Carrying: when a column passes 9",
          paras: [
            "A column has room for one digit only. If the ones come to 15 you cannot write 15 there. You write the 5 and move the 10 into the tens column, where it counts as a single ten.",
            "That is what the little 1 above the tens column means. It is not “one”, it is “one ten” — which is exactly why it belongs in the tens column and nowhere else.",
          ],
          example: { q: "47 + 68", steps: ["Ones: 7 + 8 = 15. Write the 5, carry 1 ten.", "Tens: 4 + 6 = 10, plus the carried ten makes 11.", "Write 11 in front of the 5."], a: "115" },
        },
        {
          heading: "Checking without redoing it",
          paras: [
            "Round both numbers and add them in your head first. 47 is about 50, 68 is about 70, so the answer should be near 120. When you get 115, that fits. If you had got 105, or 1015, the estimate would have caught it.",
            "There is a hard limit too. The smallest sum here is 10 + 10 = 20 and the largest is 99 + 99 = 198, so a three-digit answer always starts with a 1. Anything else is a mistake.",
          ],
        },
      ],
      mistakes: [
        "Forgetting the carry. This is the big one: 47 + 68 comes out as 105 instead of 115.",
        "Writing the whole 15 in the ones column, so the answer sprouts an extra digit.",
        "Adding the carry into the ones column instead of the tens.",
        "Lining the numbers up by their left edges rather than by place value.",
      ],
      recap: [
        "Split every number into tens and ones — that is all place value means.",
        "Stack by place value, add right to left.",
        "A column over 9 keeps its ones digit and carries the ten leftward.",
        "Round and estimate first, so a wrong answer has somewhere to be caught.",
      ],
      practice: [
        { q: "23 + 45", a: "68" },
        { q: "58 + 27", a: "85" },
        { q: "64 + 39", a: "103" },
        { q: "76 + 88", a: "164" },
        { q: "19 + 91", a: "110" },
      ],
    },
    {
      title: "Adding a two-digit number to a three-digit one",
      intro: "Now the two numbers are different lengths — 286 + 47. Nothing about the method changes, but the lining-up step suddenly matters much more, because the two numbers no longer have the same number of columns.",
      sections: [
        {
          heading: "Line up by place value, not by the left edge",
          paras: [
            "In 286 + 47, the 4 is four tens. It has to sit under the 8, which is eight tens — not under the 2, which is two hundreds.",
            "Writing the shorter number pushed to the right does this automatically, because both numbers end in their ones digit. If it helps, write 47 as 047. That is the same number, and it makes all three columns line up on the page.",
          ],
        },
        {
          heading: "The column with nothing above it",
          paras: [
            "When you reach the hundreds, the bottom number has run out. There is nothing to add, so the hundreds digit comes straight down — plus any carry arriving from the tens.",
            "Thinking of it as 047 makes this ordinary rather than a special case: you are adding 0 hundreds, which changes nothing.",
          ],
        },
        {
          heading: "Two carries in a row",
          paras: [
            "At this level a carry out of the ones often forces a second carry out of the tens. Each one is handled the same way — keep the ones digit, push the ten leftward — but you have to hold onto both.",
            "Write each carry down above its column as you go. Trying to remember them is where the errors come from.",
          ],
          example: { q: "286 + 47", steps: ["Ones: 6 + 7 = 13. Write 3, carry 1.", "Tens: 8 + 4 = 12, plus the carry is 13. Write 3, carry 1.", "Hundreds: 2, plus the carry is 3."], a: "333" },
        },
        {
          heading: "Estimating at this size",
          paras: [
            "Round to the nearest ten: 286 is about 290, 47 is about 50, so expect roughly 340. Getting 333 is comfortably close.",
            "The range is wider now — anywhere from 100 + 10 = 110 up to 999 + 99 = 1098 — so a four-digit answer is possible here, but only just, and only when the three-digit number is already in the 900s.",
          ],
        },
      ],
      mistakes: [
        "Lining up the left edges, which quietly turns 47 into 470.",
        "Forgetting to bring the hundreds digit down once the bottom number runs out.",
        "Dropping the second carry when two happen in the same sum.",
      ],
      recap: [
        "Different lengths change nothing except how carefully you align.",
        "Pad the short number with a leading zero if the columns are hard to see.",
        "An empty column still gets whatever carry arrives in it.",
        "Estimate to the nearest ten before you start.",
      ],
      practice: [
        { q: "132 + 45", a: "177" },
        { q: "508 + 76", a: "584" },
        { q: "264 + 89", a: "353" },
        { q: "735 + 68", a: "803" },
        { q: "99 + 901", a: "1000" },
      ],
    },
    {
      title: "Adding three-digit numbers",
      intro: "Both numbers are now three digits — 487 + 936. Three columns instead of two, and for the first time the answer can spill into a fourth column that neither number had.",
      sections: [
        {
          heading: "Three columns, one method",
          paras: [
            "Ones under ones, tens under tens, hundreds under hundreds. Add right to left, carrying whenever a column passes 9. Nothing new so far — it is the same procedure with one more column.",
          ],
          example: { q: "234 + 512", steps: ["Ones: 4 + 2 = 6.", "Tens: 3 + 1 = 4.", "Hundreds: 2 + 5 = 7."], a: "746" },
        },
        {
          heading: "Carrying into the thousands",
          paras: [
            "The hundreds column can overflow just like the others. 4 hundreds plus 9 hundreds is 13 hundreds — which is 1 thousand and 3 hundreds. The 3 stays and the 1 starts a brand new column.",
            "Your answer is then four digits long even though both numbers were three. That is normal, not a mistake.",
          ],
          example: { q: "487 + 936", steps: ["Ones: 7 + 6 = 13. Write 3, carry 1.", "Tens: 8 + 3 = 11, plus the carry is 12. Write 2, carry 1.", "Hundreds: 4 + 9 = 13, plus the carry is 14. Write 4 and carry the 1 into a new thousands column."], a: "1423" },
        },
        {
          heading: "Chains of carries",
          paras: [
            "Sometimes every single column carries. When that happens each carry sets off the next, and it is easy to lose one partway along.",
            "The cure is mechanical: write the carry above the next column the moment you produce it, before you add anything else.",
          ],
          example: { q: "199 + 801", steps: ["Ones: 9 + 1 = 10. Write 0, carry 1.", "Tens: 9 + 0 = 9, plus the carry is 10. Write 0, carry 1.", "Hundreds: 1 + 8 = 9, plus the carry is 10. Write 0 and carry 1."], a: "1000" },
        },
        {
          heading: "Two ways to check",
          paras: [
            "Round to the nearest hundred: 487 is about 500 and 936 is about 900, so expect around 1400. An answer of 1423 fits; one of 423 does not.",
            "Or undo it. Subtract one of the original numbers from your answer and you should get the other one back: 1423 − 936 = 487. Addition and subtraction reverse each other, which makes each a free check on the other.",
          ],
        },
      ],
      mistakes: [
        "Stopping after three columns when the hundreds have carried, and losing the leading 1.",
        "Dropping a carry in the middle of a chain — the answer then comes out 10 or 100 short.",
        "Adding the carry to the column it came from instead of the one to its left.",
      ],
      recap: [
        "Same method, one more column.",
        "The hundreds column can carry, and that carry opens a thousands column.",
        "Write every carry down the instant it appears.",
        "Check by rounding to hundreds, or by subtracting back.",
      ],
      practice: [
        { q: "234 + 512", a: "746" },
        { q: "478 + 265", a: "743" },
        { q: "609 + 397", a: "1006" },
        { q: "888 + 777", a: "1665" },
        { q: "150 + 850", a: "1000" },
      ],
    },
  ],

  // ---- Bronze · Subtraction ------------------------------------------------
  subtraction: [
    {
      title: "Subtracting two-digit numbers",
      intro: "Two numbers between 10 and 99, with the larger one always written first, so the answer is never negative. The method mirrors addition exactly — with one new move where addition had carrying.",
      sections: [
        {
          heading: "Take away column by column",
          paras: [
            "Stack the numbers by place value, larger on top, and work right to left. Subtract the ones, then the tens.",
            "When every top digit is big enough, that is the entire job.",
          ],
          example: { q: "78 − 35", steps: ["Ones: 8 − 5 = 3.", "Tens: 7 − 3 = 4."], a: "43" },
        },
        {
          heading: "Borrowing, when the top digit is too small",
          paras: [
            "In 62 − 38 the ones column asks for 2 − 8, which will not go. So you fetch a ten from next door: the 6 tens become 5 tens, and those ten ones join the 2 to make 12.",
            "Nothing has been created or destroyed. 62 was 60 + 2 and is now 50 + 12 — the same number, rearranged so the subtraction fits.",
          ],
          example: { q: "62 − 38", steps: ["Ones: 2 − 8 will not go. Borrow a ten: the 6 becomes 5, the 2 becomes 12.", "12 − 8 = 4.", "Tens: 5 − 3 = 2."], a: "24" },
        },
        {
          heading: "Checking by adding back",
          paras: [
            "Subtraction undoes addition, so addition can check subtraction. If 62 − 38 = 24, then 24 + 38 should be 62. It is.",
            "This check catches borrowing mistakes almost every time, and it costs you one quick sum.",
          ],
        },
        {
          heading: "Estimating",
          paras: [
            "Round both: 62 is about 60, 38 is about 40, so the answer should be near 20. Getting 24 is fine. Getting 36 — which is what the most common error produces — would look wrong immediately.",
          ],
        },
      ],
      mistakes: [
        "Subtracting the smaller digit from the larger one whichever way round they sit. In 62 − 38 that turns the ones column into 8 − 2 = 6 and gives 36. This is the single most common subtraction error there is.",
        "Borrowing but forgetting to drop the column you borrowed from by one.",
        "Writing the numbers in the order they appear rather than largest on top.",
      ],
      recap: [
        "Stack by place value, work right to left.",
        "If the top digit is too small, borrow a ten from the left — that column drops by 1, this one gains 10.",
        "Never flip a column round just because the bottom digit is bigger.",
        "Add your answer back to check.",
      ],
      practice: [
        { q: "87 − 42", a: "45" },
        { q: "64 − 29", a: "35" },
        { q: "50 − 17", a: "33" },
        { q: "91 − 88", a: "3" },
        { q: "73 − 36", a: "37" },
      ],
    },
    {
      title: "Subtracting a two-digit number from a three-digit one",
      intro: "Now it is something like 342 − 57. The extra column brings the situation that trips up more people than any other in arithmetic: borrowing when the column next door has nothing to give.",
      sections: [
        {
          heading: "Line up by place value",
          paras: [
            "The 5 in 57 is five tens, so it belongs under the 4 of 342, not under the 3. Push the shorter number right, or pad it as 057 — either way the ones end up over the ones.",
          ],
        },
        {
          heading: "Borrowing more than once",
          paras: [
            "A borrow can set off another borrow. Take it one column at a time and write down what each column has become before moving on.",
          ],
          example: { q: "342 − 57", steps: ["Ones: 2 − 7 will not go. Borrow a ten: the 4 becomes 3, the 2 becomes 12. 12 − 7 = 5.", "Tens: 3 − 5 will not go. Borrow a hundred: the 3 becomes 2, the 3 tens become 13. 13 − 5 = 8.", "Hundreds: 2, and nothing to take away."], a: "285" },
        },
        {
          heading: "Borrowing across a zero",
          paras: [
            "In 305 − 68 the ones need a ten, but the tens column is 0 and has none. So you go one further left: take a hundred and turn it into ten tens. Now the tens column holds 10 and can lend one.",
            "After lending, the tens column is left with 9. That is the step people get wrong — they leave a 10 there, or a 0. It becomes 9, because it had ten and gave one away.",
          ],
          example: { q: "305 − 68", steps: ["Ones need a ten, but the tens are 0. Take a hundred instead: 3 hundreds become 2, and the tens become 10.", "Now lend one of those tens to the ones: the tens become 9, the ones become 15.", "15 − 8 = 7. Tens: 9 − 6 = 3. Hundreds: 2."], a: "237" },
        },
        {
          heading: "Checking",
          paras: [
            "Add back: 237 + 68 = 305. Correct. With borrowing this involved, the check is worth doing every time.",
          ],
        },
      ],
      mistakes: [
        "Turning a borrowed-through zero into 10 instead of 9.",
        "Aligning the two-digit number under the hundreds.",
        "Borrowing from a column and then forgetting you did, so it is used at full value later.",
      ],
      recap: [
        "Pad the short number with a leading zero and the columns take care of themselves.",
        "A borrow can trigger another borrow — go one column at a time.",
        "Borrowing through a zero leaves 9 behind, not 10.",
        "Always add back at the end.",
      ],
      practice: [
        { q: "256 − 43", a: "213" },
        { q: "431 − 76", a: "355" },
        { q: "600 − 89", a: "511" },
        { q: "702 − 58", a: "644" },
        { q: "120 − 99", a: "21" },
      ],
    },
    {
      title: "Subtracting three-digit numbers",
      intro: "Three digits on both sides — 523 − 178, or 800 − 246. Everything you already do, now with more columns for a borrow to travel through.",
      sections: [
        {
          heading: "Same method, three columns",
          paras: [
            "Stack, work right to left, borrow where a top digit is too small. When no borrowing is needed the sum takes seconds.",
          ],
          example: { q: "654 − 231", steps: ["Ones: 4 − 1 = 3.", "Tens: 5 − 3 = 2.", "Hundreds: 6 − 2 = 4."], a: "423" },
        },
        {
          heading: "Two borrows in one sum",
          paras: [
            "It is common now for both the ones and the tens to need help. Handle them in order and update each column on the page as you go.",
          ],
          example: { q: "523 − 178", steps: ["Ones: 3 − 8 will not go. Borrow: the 2 becomes 1, the 3 becomes 13. 13 − 8 = 5.", "Tens: 1 − 7 will not go. Borrow: the 5 becomes 4, the 1 becomes 11. 11 − 7 = 4.", "Hundreds: 4 − 1 = 3."], a: "345" },
        },
        {
          heading: "Borrowing through a run of zeros",
          paras: [
            "Round numbers like 800 or 1000 are the hardest to subtract from, because the borrow has to travel across every zero in turn.",
            "Do it in two visible steps rather than one leap: break a hundred into ten tens first, then break one of those tens into ten ones. Each zero you pass through ends up as a 9.",
          ],
          example: { q: "800 − 246", steps: ["The ones need a ten and the tens are 0, so take a hundred: 8 hundreds become 7, the tens become 10.", "Lend one of those tens onward: the tens become 9, the ones become 10.", "Ones: 10 − 6 = 4. Tens: 9 − 4 = 5. Hundreds: 7 − 2 = 5."], a: "554" },
        },
        {
          heading: "Checking",
          paras: [
            "554 + 246 = 800. The check is the same as ever, and at this size it is genuinely worth the ten seconds.",
          ],
        },
      ],
      mistakes: [
        "Leaving 10 rather than 9 in a column that was borrowed through.",
        "Borrowing from a column that you have already borrowed from, at its old value.",
        "Rushing a sum like 900 − 458 because it looks round — those are the ones that need the most care.",
      ],
      recap: [
        "Three columns, same rules.",
        "Break a borrow into single steps when it crosses zeros — every zero it passes becomes 9.",
        "Update the page as you go rather than tracking borrows in your head.",
        "Add back to check.",
      ],
      practice: [
        { q: "765 − 432", a: "333" },
        { q: "814 − 267", a: "547" },
        { q: "900 − 458", a: "442" },
        { q: "501 − 396", a: "105" },
        { q: "642 − 599", a: "43" },
      ],
    },
  ],

  // ---- Bronze · Multiplication ---------------------------------------------
  multiplication: [
    {
      title: "Single-digit multiplication",
      intro: "Two numbers from 1 to 9, multiplied — 7 × 6, 8 × 9. These are the times tables, and everything in the rest of the M Games is built on knowing them without stopping to think.",
      sections: [
        {
          heading: "Multiplication is repeated addition",
          paras: [
            "6 × 4 means four sixes added up: 6 + 6 + 6 + 6 = 24. That is what the symbol means, and it is always available when a fact escapes you.",
            "Counting up like that is slow, though, which is exactly why the tables are worth memorising. The point of learning them is to stop doing the addition.",
          ],
        },
        {
          heading: "The order never matters",
          paras: [
            "6 × 4 and 4 × 6 are both 24. Four rows of six dots and six rows of four dots are the same rectangle looked at sideways.",
            "This halves what there is to learn. Once you know 7 × 8, you know 8 × 7 for free — and it means you can always take whichever version you find easier.",
          ],
        },
        {
          heading: "The shortcuts worth having",
          paras: [
            "×2 is doubling. ×4 is doubling twice. ×8 is doubling three times: 7 × 8 is 7 → 14 → 28 → 56.",
            "×5 lands on 0 or 5 every time, and is half of ×10: 8 × 5 is half of 80, so 40.",
            "×9 has a pattern worth knowing: the two digits of the answer always add to 9, and the first digit is one less than the number you multiplied. 9 × 7 starts with 6, and 6 + 3 = 9, so it is 63.",
          ],
          example: { q: "8 × 9", steps: ["One less than 8 is 7, so the answer starts with 7.", "The digits must add to 9, so the second digit is 2."], a: "72" },
        },
        {
          heading: "Rebuilding the ones you forget",
          paras: [
            "Only a handful are genuinely hard — 6 × 7, 7 × 8, 6 × 8, 7 × 9. For those, build from a fact you do know rather than guessing.",
            "7 × 8: if 7 × 4 = 28 is solid, double it to get 56. 6 × 7: 6 × 6 = 36 is easy to remember, so add one more 6 to get 42.",
          ],
        },
      ],
      mistakes: [
        "Adding instead of multiplying under time pressure: 7 × 8 answered as 15.",
        "Slipping one row in the table — 6 × 7 given as 48, which is 6 × 8.",
        "Guessing at the four or five hard facts instead of rebuilding them from an easier one.",
      ],
      recap: [
        "a × b means b copies of a added together.",
        "Order does not matter, which halves the learning.",
        "Doubling covers ×2, ×4 and ×8; ×5 is half of ×10; ×9 has a digit pattern.",
        "Build the hard facts out of easy ones instead of guessing.",
      ],
      practice: [
        { q: "7 × 6", a: "42" },
        { q: "8 × 9", a: "72" },
        { q: "4 × 7", a: "28" },
        { q: "6 × 8", a: "48" },
        { q: "9 × 9", a: "81" },
      ],
    },
    {
      title: "Two-digit times one-digit",
      intro: "Something like 34 × 6 or 87 × 9. The two-digit number gets split into its tens and its ones, each part is multiplied, and the pieces are added back together.",
      sections: [
        {
          heading: "Split, multiply, add",
          paras: [
            "34 × 6 is (30 × 6) + (4 × 6). Thirty sixes plus four sixes is thirty-four sixes — no value has gone missing.",
            "30 × 6 is just 3 × 6 with a zero on the end: 180. Add the 24 from the ones and you have 204. Done entirely in your head, if you want.",
          ],
          example: { q: "34 × 6", steps: ["Tens: 30 × 6 = 180.", "Ones: 4 × 6 = 24.", "180 + 24."], a: "204" },
        },
        {
          heading: "The column method",
          paras: [
            "On paper, write the two-digit number on top and the single digit underneath, lined up with the ones. Multiply the ones digit first, then the tens.",
            "If the ones product passes 9, carry the tens part of it above the tens column — the same carrying you already do in addition.",
          ],
          example: { q: "34 × 6 in columns", steps: ["Ones: 4 × 6 = 24. Write the 4, carry 2.", "Tens: 3 × 6 = 18, then add the carried 2 to get 20.", "Write 20 in front of the 4."], a: "204" },
        },
        {
          heading: "Multiply first, then add the carry",
          paras: [
            "This is the one genuinely new rule at this level, and it is the opposite of what feels natural. The carry is added after the multiplication, never before.",
            "In 87 × 9 the ones give 63, so you carry 6. The tens step is 8 × 9 = 72, and then + 6 = 78. It is not 8 × (9 + 6). Getting that backwards is by far the most common error here.",
          ],
          example: { q: "87 × 9", steps: ["Ones: 7 × 9 = 63. Write 3, carry 6.", "Tens: 8 × 9 = 72 first, then add the carry: 78."], a: "783" },
        },
        {
          heading: "Estimating",
          paras: [
            "Round the two-digit number: 87 is nearly 90, and 90 × 9 = 810. So 783 is about right, and an answer like 133 or 7830 would stand out at once.",
          ],
        },
      ],
      mistakes: [
        "Adding the carry before multiplying instead of after.",
        "Multiplying the tens digit as though it were a single digit and forgetting it stands for tens.",
        "Losing the carry entirely when the ones product is large.",
      ],
      recap: [
        "Split the two-digit number into tens and ones, multiply each, add the results.",
        "In columns: ones first, carry, then tens.",
        "Multiply, then add the carry — in that order.",
        "Round and estimate before you commit.",
      ],
      practice: [
        { q: "23 × 4", a: "92" },
        { q: "56 × 7", a: "392" },
        { q: "48 × 6", a: "288" },
        { q: "75 × 8", a: "600" },
        { q: "99 × 3", a: "297" },
      ],
    },
    {
      title: "Two-digit times two-digit",
      intro: "34 × 26, and every question like it. Both numbers split now, which turns one multiplication into four smaller ones — and introduces the shift that everybody forgets at least once.",
      sections: [
        {
          heading: "Four smaller products",
          paras: [
            "34 × 26 is (30 + 4) × (20 + 6). Every part of the first number has to meet every part of the second, which gives four products: 30×20, 30×6, 4×20 and 4×6.",
            "That is 600 + 180 + 80 + 24 = 884. Slow, but it shows exactly where the answer comes from, and it is worth doing once before trusting the shortcut.",
          ],
          example: { q: "34 × 26 the long way", steps: ["30 × 20 = 600.", "30 × 6 = 180.", "4 × 20 = 80.", "4 × 6 = 24.", "600 + 180 + 80 + 24."], a: "884" },
        },
        {
          heading: "The two-row column method",
          paras: [
            "In practice you group those four products into two rows. First multiply the whole top number by the ones digit of the bottom, then by its tens digit, then add the two rows.",
            "34 × 6 = 204 is the first row. 34 × 20 = 680 is the second. Added together: 884 — the same answer, in half the steps.",
          ],
          example: { q: "34 × 26 in columns", steps: ["First row: 34 × 6 = 204.", "Second row: 34 × 20 = 680.", "Add the rows: 204 + 680."], a: "884" },
        },
        {
          heading: "Where the shift comes from",
          paras: [
            "The second row is written one place further left, and it is not a formatting habit — it is the whole reason the method works. That row is 34 × 20, not 34 × 2, and the leftward shift is what multiplies it by ten.",
            "If you find yourself forgetting it, write the 0 in explicitly: put a 0 in the ones place of the second row before you start multiplying. Then there is nothing to remember.",
          ],
        },
        {
          heading: "Estimating",
          paras: [
            "Round both to the nearest ten: 34 is about 30, 26 is about 30, and 30 × 30 = 900. So 884 is believable.",
            "This check is especially valuable here, because the classic mistake — dropping the shift — produces 272, which the estimate rejects instantly.",
          ],
        },
      ],
      mistakes: [
        "Forgetting to shift the second row, which gives 204 + 68 = 272 instead of 884.",
        "Multiplying only the tens by the tens and the ones by the ones, so two of the four products go missing.",
        "Carrying from the first row into the second — each row has its own carries, and they do not travel between rows.",
      ],
      recap: [
        "Every part of one number multiplies every part of the other: four products in all.",
        "In columns that becomes two rows — one for the ones digit, one for the tens.",
        "The second row shifts one place left because it is really × a multiple of ten.",
        "Round both numbers and estimate; it catches the missing shift immediately.",
      ],
      practice: [
        { q: "21 × 34", a: "714" },
        { q: "45 × 23", a: "1035" },
        { q: "67 × 18", a: "1206" },
        { q: "52 × 46", a: "2392" },
        { q: "99 × 11", a: "1089" },
      ],
    },
  ],

  // ---- Bronze · Division ---------------------------------------------------
  division: [
    {
      title: "Dividing a two-digit number by a single digit",
      intro: "Questions like 56 ÷ 7 and 96 ÷ 4. Every division in the M Games comes out exactly — there are never any remainders — so if yours does not divide evenly, something has gone wrong earlier.",
      sections: [
        {
          heading: "Division asks how many fit",
          paras: [
            "56 ÷ 7 is asking: how many 7s make 56? Eight of them. That is the question behind every division sign.",
            "Which means division is the times tables read backwards. If you know 7 × 8 = 56, you already know 56 ÷ 7 = 8 and 56 ÷ 8 = 7. Nothing extra to learn — just a different way in.",
          ],
        },
        {
          heading: "Straight from the tables",
          paras: [
            "When the number is inside the tables you know, answer it directly. 72 ÷ 8: which number times 8 gives 72? Nine.",
            "It pays to go looking. Faced with 84 ÷ 7, run up the 7s — 7, 14, 21 ... 70, 77, 84 — and count how many you passed. Twelve.",
          ],
        },
        {
          heading: "Long division, for the rest",
          paras: [
            "When the answer is past the tables, work one digit at a time from the left. At each step ask how many times the divisor fits, write that digit above, multiply back, subtract, and bring down the next digit.",
            "Keep each answer digit directly above the digit you just used. The columns are what keep the place value straight, exactly as in addition.",
          ],
          example: { q: "96 ÷ 4", steps: ["4 into 9 goes 2 times (8), leaving 1.", "Bring down the 6 to make 16.", "4 into 16 goes 4 times exactly."], a: "24" },
        },
        {
          heading: "Checking by multiplying back",
          paras: [
            "Multiply your answer by the divisor and you should land back on the number you started with: 24 × 4 = 96. Since these all divide exactly, this check either passes cleanly or fails obviously.",
          ],
        },
      ],
      mistakes: [
        "Dividing the wrong way round — treating 56 ÷ 7 as 7 ÷ 56.",
        "Writing an answer digit above the wrong column, which shifts the whole answer.",
        "Accepting a remainder. At this level there are none, so a leftover means an arithmetic slip.",
      ],
      recap: [
        "Division asks how many of the divisor fit into the number.",
        "It is the times tables backwards — use them first.",
        "For bigger answers: divide, multiply, subtract, bring down, repeat.",
        "Multiply back to check; it should come out exact.",
      ],
      practice: [
        { q: "72 ÷ 8", a: "9" },
        { q: "96 ÷ 6", a: "16" },
        { q: "84 ÷ 7", a: "12" },
        { q: "91 ÷ 7", a: "13" },
        { q: "78 ÷ 3", a: "26" },
      ],
    },
    {
      title: "Dividing a three-digit number by a single digit",
      intro: "476 ÷ 7, 936 ÷ 4, and their kind. One more digit to work through, and one new situation to watch for — a zero in the middle of the answer.",
      sections: [
        {
          heading: "One digit at a time, left to right",
          paras: [
            "The loop never changes: how many times does the divisor fit, write that above, multiply back, subtract, bring down the next digit. Repeat until the digits run out.",
            "Unlike addition and subtraction, division works left to right. The big place values are settled first.",
          ],
        },
        {
          heading: "When the first digit is too small",
          paras: [
            "In 476 ÷ 7 the divisor does not fit into 4 at all. Rather than write a leading 0, take the first two digits together and start from 47.",
            "The answer is then two digits long instead of three, which is exactly right: 476 ÷ 7 is 68, not 068.",
          ],
          example: { q: "476 ÷ 7", steps: ["7 does not fit into 4, so take 47. It fits 6 times (42), leaving 5.", "Bring down the 6 to make 56.", "7 fits into 56 exactly 8 times."], a: "68" },
        },
        {
          heading: "When it does fit straight away",
          paras: [
            "If the divisor fits into the first digit, start there and the answer will be three digits long.",
          ],
          example: { q: "936 ÷ 4", steps: ["4 into 9 goes 2 (8), leaving 1.", "Bring down the 3 to make 13. 4 into 13 goes 3 (12), leaving 1.", "Bring down the 6 to make 16. 4 into 16 goes 4."], a: "234" },
        },
        {
          heading: "Zeros in the answer",
          paras: [
            "Sometimes the divisor will not fit into what you are holding. When that happens you must write a 0 above that digit and carry on — it is a real part of the answer, not a step to skip.",
            "In 618 ÷ 6, after the first step you are left holding 1, and 6 does not fit into 1. Write 0, bring down the 8, and continue. Skipping that zero turns 103 into 13, an answer nearly ten times too small.",
          ],
          example: { q: "618 ÷ 6", steps: ["6 into 6 goes 1, leaving 0.", "Bring down the 1. 6 does not fit into 1, so write 0 above it.", "Bring down the 8 to make 18. 6 into 18 goes 3."], a: "103" },
        },
      ],
      mistakes: [
        "Skipping the 0 when the divisor will not fit, which drops a digit off the answer.",
        "Forgetting to bring the next digit down before dividing again.",
        "Losing track of which column each answer digit belongs above.",
      ],
      recap: [
        "Divide, multiply, subtract, bring down — then go again.",
        "If the divisor will not fit the first digit, start with the first two.",
        "If it will not fit at any step, write 0 and carry on.",
        "Multiply back at the end; it should be exact.",
      ],
      practice: [
        { q: "455 ÷ 5", a: "91" },
        { q: "672 ÷ 8", a: "84" },
        { q: "819 ÷ 9", a: "91" },
        { q: "728 ÷ 7", a: "104" },
        { q: "432 ÷ 6", a: "72" },
      ],
    },
    {
      title: "Dividing a three-digit number by a two-digit one",
      intro: "682 ÷ 22, 384 ÷ 16. The divisor is now too big to look up in a times table, so each step becomes an estimate that you test — which is the real skill this level is teaching.",
      sections: [
        {
          heading: "Why this feels harder",
          paras: [
            "With a single-digit divisor you simply knew how many times it fitted. With 22 or 16 there is no table to recall, so you have to make a sensible guess and then check it.",
            "The method is otherwise identical. Only the “how many times does it fit” step changes.",
          ],
        },
        {
          heading: "Estimate from a rounded divisor",
          paras: [
            "Round the divisor to the nearest ten and use that to guess. For 682 ÷ 22, think of 22 as 20. How many 20s in 68? About three.",
            "Then test it properly with the real divisor: 22 × 3 = 66, which fits inside 68 with 2 left over. The guess holds, so 3 is the digit.",
          ],
          example: { q: "682 ÷ 22", steps: ["22 into 68: think 20 into 68, about 3. Test: 22 × 3 = 66 ≤ 68. Write 3, subtract to leave 2.", "Bring down the 2 to make 22.", "22 into 22 goes exactly once."], a: "31" },
        },
        {
          heading: "When the estimate is wrong",
          paras: [
            "Rounding down makes you overestimate, so be ready to correct. There are only two failure modes, and both are easy to spot.",
            "If the product overshoots what you are holding, your digit is one too big — drop it by one and try again. If what is left over is bigger than the divisor, the digit was one too small — raise it. Either way you have lost a few seconds, not the sum.",
          ],
          example: { q: "384 ÷ 16", steps: ["16 into 38: think 20 into 38, about 2. Test: 16 × 2 = 32 ≤ 38, leaving 6.", "Bring down the 4 to make 64.", "16 into 64: think 20 into 64, about 3. Test: 16 × 3 = 48, leaving 16 — the same as the divisor, so 3 was too small. Try 4: 16 × 4 = 64 exactly."], a: "24" },
        },
        {
          heading: "Write the table out first",
          paras: [
            "If a divisor is going to be used several times, spend twenty seconds listing its multiples before you start: 16, 32, 48, 64, 80 and so on. Then every step is a lookup rather than a guess.",
            "For an exam this feels like a detour. It is almost always faster than guessing wrong twice.",
          ],
        },
      ],
      mistakes: [
        "Estimating from the rounded divisor and never testing against the real one.",
        "Not noticing that the remainder has grown bigger than the divisor, which always means the digit was too small.",
        "Giving up after one wrong guess instead of nudging the digit by one.",
      ],
      recap: [
        "Same loop as before; only the “how many fit” step is harder.",
        "Round the divisor to guess, then test with the true divisor.",
        "Product too big means go down one; remainder too big means go up one.",
        "Listing the divisor's multiples first turns guessing into looking up.",
      ],
      practice: [
        { q: "294 ÷ 14", a: "21" },
        { q: "576 ÷ 24", a: "24" },
        { q: "714 ÷ 21", a: "34" },
        { q: "912 ÷ 38", a: "24" },
        { q: "884 ÷ 26", a: "34" },
      ],
    },
  ],

  // ---- Silver · Fractions --------------------------------------------------
  fractions: [
    {
      title: "Adding fractions with the same denominator",
      intro: "Both fractions share a bottom number — 2/9 + 4/9 — and the answer has to be given reduced. This is the easiest case there is, and it exists to make one idea obvious before the harder cases arrive.",
      sections: [
        {
          heading: "What the two numbers do",
          paras: [
            "The bottom number, the denominator, says how big the pieces are: sevenths, ninths, twelfths. The top number, the numerator, says how many of them you have.",
            "So 4/9 is four pieces, each a ninth of the whole. Reading a fraction that way makes almost everything else follow.",
          ],
        },
        {
          heading: "Same denominator, so just count",
          paras: [
            "If both fractions are made of ninths, adding them is counting: two ninths plus four ninths is six ninths. Add the numerators and leave the denominator alone.",
            "The denominator does not change because the pieces did not change size — you only ended up with more of them. This is exactly why adding the bottoms is nonsense.",
          ],
          example: { q: "2/9 + 4/9", steps: ["Both are ninths, so add the tops: 2 + 4 = 6.", "The pieces are still ninths: 6/9.", "6 and 9 both divide by 3."], a: "2/3" },
        },
        {
          heading: "Reducing the answer",
          paras: [
            "Every answer here has to be in lowest terms. Find the largest number that divides both top and bottom, and divide both by it.",
            "6/9 divides by 3 to give 2/3. If you only spot a smaller factor, that is fine — keep going until nothing divides both. Halving 4/12 to 2/6 and again to 1/3 gets to the same place as dividing by 4 at once.",
          ],
        },
        {
          heading: "When the answer passes 1",
          paras: [
            "Nothing stops the numerators adding to more than the denominator. 5/8 + 7/8 is 12/8, which is more than a whole.",
            "Reduce it as normal — 12/8 becomes 3/2 — and leave it there. The game wants the improper fraction, not a mixed number, so 3/2 rather than 1 1/2.",
          ],
          example: { q: "5/8 + 7/8", steps: ["Add the tops: 5 + 7 = 12, so 12/8.", "Both divide by 4.", "That gives 3/2 — more than one whole, which is fine."], a: "3/2" },
        },
      ],
      mistakes: [
        "Adding the denominators as well: 2/9 + 4/9 given as 6/18. The pieces do not get smaller because you collected more of them.",
        "Forgetting to reduce. 6/9 is the right value but the wrong form, and it will be marked wrong.",
        "Turning an improper answer into a mixed number when the question asked for a fraction.",
      ],
      recap: [
        "The denominator names the size of the piece; the numerator counts them.",
        "Same denominator means you add the tops only.",
        "Always reduce: divide top and bottom by their common factor.",
        "Answers over 1 stay as improper fractions.",
      ],
      practice: [
        { q: "1/6 + 3/6", a: "2/3" },
        { q: "5/12 + 1/12", a: "1/2" },
        { q: "3/10 + 4/10", a: "7/10" },
        { q: "7/9 + 5/9", a: "4/3" },
        { q: "2/5 + 2/5", a: "4/5" },
      ],
    },
    {
      title: "Adding and subtracting unlike fractions",
      intro: "Now the denominators differ — 2/5 + 3/7, or 5/6 − 3/8. You cannot count pieces of different sizes, so the whole job is rewriting both fractions with the same denominator first.",
      sections: [
        {
          heading: "Why you cannot just add",
          paras: [
            "Fifths and sevenths are different-sized pieces. Two fifths plus three sevenths is not five of anything, so there is nothing to count until the pieces match.",
            "Rewriting a fraction with a bigger denominator does not change its value — 2/5 and 14/35 are the same amount, cut more finely. That is what makes the whole method legal.",
          ],
        },
        {
          heading: "Finding a common denominator",
          paras: [
            "Multiplying the two denominators together always works: for fifths and sevenths, use 35ths. It is never wrong, and at this level the numbers stay small enough that it is usually the fastest route.",
            "If the denominators share a factor you can do better. For 5/6 and 3/8, multiplying gives 48ths, but 24 works too and keeps the arithmetic lighter. Look for the smallest number both divide into.",
          ],
        },
        {
          heading: "Rewriting both fractions",
          paras: [
            "Whatever you multiply the bottom by, multiply the top by as well. 2/5 becomes 14/35 because both parts were multiplied by 7; 3/7 becomes 15/35 because both were multiplied by 5.",
            "There is a formula that does all of this at once: a/b + c/d = (ad + bc)/bd. It is worth knowing, but only once you can see where it comes from.",
          ],
          example: { q: "2/5 + 3/7", steps: ["Common denominator: 5 × 7 = 35.", "2/5 = 14/35 and 3/7 = 15/35.", "Add the tops: 14 + 15 = 29.", "29 and 35 share no factor."], a: "29/35" },
        },
        {
          heading: "Subtracting works the same",
          paras: [
            "Match the denominators, then subtract the numerators. Nothing else changes.",
            "The game always puts the larger fraction first when it subtracts, so you will not end up with a negative answer.",
          ],
          example: { q: "5/6 − 3/8", steps: ["6 and 8 both divide into 24.", "5/6 = 20/24 and 3/8 = 9/24.", "Subtract the tops: 20 − 9 = 11.", "11 and 24 share no factor."], a: "11/24" },
        },
      ],
      mistakes: [
        "Adding tops and bottoms straight across: 1/2 + 1/3 given as 2/5. The right answer, 5/6, is bigger than either fraction — 2/5 is smaller than 1/2, which should look wrong immediately.",
        "Changing the denominator but forgetting to scale the numerator with it.",
        "Doing all the work correctly and then not reducing.",
      ],
      recap: [
        "Different-sized pieces cannot be counted together — match them first.",
        "Multiplying the denominators always gives a workable common denominator.",
        "Scale the numerator by the same factor as the denominator.",
        "Then add or subtract the tops, keep the denominator, and reduce.",
      ],
      practice: [
        { q: "1/2 + 1/3", a: "5/6" },
        { q: "3/4 − 2/5", a: "7/20" },
        { q: "2/3 + 1/6", a: "5/6" },
        { q: "5/6 − 1/4", a: "7/12" },
        { q: "3/8 + 1/2", a: "7/8" },
      ],
    },
    {
      title: "Multiplying and dividing fractions",
      intro: "2/3 × 4/5, or 3/4 ÷ 2/9. After the effort of common denominators this comes as a relief: multiplying fractions is easier than adding them, and dividing is multiplying with one extra move.",
      sections: [
        {
          heading: "Multiply straight across",
          paras: [
            "Tops together, bottoms together. 2/3 × 4/5 is (2 × 4)/(3 × 5) = 8/15. No common denominator, no rewriting.",
            "It works because multiplying by 4/5 means taking four fifths of something. Cutting thirds into fifths gives fifteenths, and you keep 8 of them.",
          ],
          example: { q: "2/3 × 4/5", steps: ["Tops: 2 × 4 = 8.", "Bottoms: 3 × 5 = 15.", "8 and 15 share no factor."], a: "8/15" },
        },
        {
          heading: "Cancel before you multiply",
          paras: [
            "You can divide any top by any bottom before multiplying, which keeps the numbers small and does most of the reducing in advance.",
            "In 4/9 × 3/8, the 4 and the 8 both divide by 4, and the 3 and the 9 both divide by 3. That leaves 1/3 × 1/2 = 1/6 — much easier than reducing 12/72 afterwards.",
          ],
          example: { q: "4/9 × 3/8", steps: ["4 and 8 both divide by 4, leaving 1 and 2.", "3 and 9 both divide by 3, leaving 1 and 3.", "Now multiply what is left: 1/3 × 1/2."], a: "1/6" },
        },
        {
          heading: "Dividing: flip and multiply",
          paras: [
            "To divide by a fraction, turn it upside down and multiply instead. 3/4 ÷ 2/9 becomes 3/4 × 9/2.",
            "Only the second fraction flips. The first one is left exactly as it was — flipping both is a common and expensive slip.",
          ],
          example: { q: "3/4 ÷ 2/9", steps: ["Flip the second fraction: 3/4 × 9/2.", "Tops: 3 × 9 = 27. Bottoms: 4 × 2 = 8.", "27 and 8 share no factor."], a: "27/8" },
        },
        {
          heading: "Why the answer can grow",
          paras: [
            "Dividing by a fraction smaller than 1 makes things bigger: 1/2 ÷ 1/4 = 2, because there are two quarters in a half.",
            "That feels wrong if you expect division to shrink things, but it is the same as asking how many quarter-pizzas fit in half a pizza. Two.",
          ],
        },
      ],
      mistakes: [
        "Looking for a common denominator. Multiplication does not need one — that habit is left over from adding.",
        "Flipping the first fraction instead of the second, or flipping both.",
        "Reducing only partway, so the answer is right in value but wrong in form.",
      ],
      recap: [
        "Multiply: tops together, bottoms together.",
        "Cancel any top against any bottom first to keep the numbers small.",
        "Divide by flipping the second fraction, then multiply.",
        "Dividing by something under 1 makes the answer bigger — that is correct.",
      ],
      practice: [
        { q: "2/5 × 3/4", a: "3/10" },
        { q: "1/2 ÷ 1/4", a: "2" },
        { q: "5/6 × 2/5", a: "1/3" },
        { q: "3/7 ÷ 6/7", a: "1/2" },
        { q: "4/9 × 3/8", a: "1/6" },
      ],
    },
  ],

  // ---- Silver · Order of Operations ----------------------------------------
  orderOps: [
    {
      title: "Multiplication before addition",
      intro: "Expressions like 6 + 4 × 7. There are two operations and only one right order to do them in — and it is not the order they are written in.",
      sections: [
        {
          heading: "Left to right is wrong",
          paras: [
            "Reading 6 + 4 × 7 straight across gives 10 × 7 = 70. That is the natural thing to do and it is not the answer.",
            "Maths agrees on a fixed order instead, so that one expression means one thing to everybody. Without it, 6 + 4 × 7 would mean 70 to some people and 34 to others.",
          ],
        },
        {
          heading: "The order",
          paras: [
            "Brackets first. Then exponents. Then multiplication and division. Then addition and subtraction, last of all.",
            "At this level only the last two lines matter: find the multiplication, do it, then add. The rest arrives in the next two levels.",
          ],
          example: { q: "6 + 4 × 7", steps: ["Multiplication first: 4 × 7 = 28.", "Now the addition: 6 + 28."], a: "34" },
        },
        {
          heading: "Why multiplication goes first",
          paras: [
            "4 × 7 is shorthand for 7 + 7 + 7 + 7. So 6 + 4 × 7 is really 6 + 7 + 7 + 7 + 7 — a single long addition, in which the four sevens are one bundle.",
            "Doing the multiplication first is just adding up that bundle before folding it into the rest. The rule is not arbitrary; it is what the shorthand already meant.",
          ],
        },
        {
          heading: "Working it neatly",
          paras: [
            "Write the expression again on each line with one more piece resolved. It takes seconds and it makes a slip visible instead of invisible.",
            "15 + 3 × 9, then 15 + 27, then 42. Three short lines, no chance of losing your place.",
          ],
          example: { q: "15 + 3 × 9", steps: ["3 × 9 = 27, so the line becomes 15 + 27.", "Then add."], a: "42" },
        },
      ],
      mistakes: [
        "Working left to right, which turns 6 + 4 × 7 into 70.",
        "Doing the multiplication but then forgetting to add the first number back in.",
        "Trying to hold both steps in your head instead of writing the middle line down.",
      ],
      recap: [
        "Brackets, exponents, × and ÷, then + and −.",
        "At this level: multiply first, then add.",
        "Multiplication binds tighter because it is bundled repeated addition.",
        "Rewrite the expression each line rather than working in your head.",
      ],
      practice: [
        { q: "5 + 6 × 3", a: "23" },
        { q: "12 + 4 × 8", a: "44" },
        { q: "9 + 7 × 2", a: "23" },
        { q: "20 + 5 × 9", a: "65" },
        { q: "3 + 8 × 8", a: "67" },
      ],
    },
    {
      title: "Brackets, then multiply, then subtract",
      intro: "Expressions like (7 + 5) × 4 − 9. Brackets have appeared, and they outrank everything — including the multiplication that used to go first.",
      sections: [
        {
          heading: "Brackets come first, always",
          paras: [
            "A bracket is an instruction: do this bit before anything else touches it. In (7 + 5) × 4 the addition happens first, even though addition is normally last.",
            "That is the point of brackets. They exist precisely so you can override the usual order when you need to.",
          ],
        },
        {
          heading: "Finish the bracket completely",
          paras: [
            "Resolve the bracket down to a single number before you use it. (7 + 5) becomes 12, and only then does the × 4 happen.",
            "Half-using a bracket — multiplying the 4 by just the 5, say — is the classic error here, and it produces an answer that looks plausible.",
          ],
          example: { q: "(7 + 5) × 4 − 9", steps: ["Bracket: 7 + 5 = 12.", "Multiply: 12 × 4 = 48.", "Subtract: 48 − 9."], a: "39" },
        },
        {
          heading: "What brackets are worth",
          paras: [
            "Compare 3 + 4 × 5 with (3 + 4) × 5. The first is 23, the second is 35. Same three numbers, same two operations, different answers.",
            "So brackets are not decoration. When one appears, it is there because the answer would otherwise be something else.",
          ],
        },
        {
          heading: "Then the rest, in order",
          paras: [
            "Once the bracket is gone you are back to the usual ranking: multiply and divide before you add and subtract.",
            "In (11 + 2) × 6 − 15, the subtraction waits until the multiplication is done, exactly as at level 1.",
          ],
          example: { q: "(11 + 2) × 6 − 15", steps: ["Bracket: 11 + 2 = 13.", "Multiply: 13 × 6 = 78.", "Subtract: 78 − 15."], a: "63" },
        },
      ],
      mistakes: [
        "Multiplying into only part of the bracket instead of resolving the whole thing first.",
        "Doing the subtraction before the multiplication because it appears later on the page.",
        "Dropping the brackets when copying the expression to the next line.",
      ],
      recap: [
        "Brackets outrank everything, including multiplication.",
        "Reduce a bracket to one number before using it.",
        "Then multiply and divide, then add and subtract.",
        "Brackets change the answer — that is why they are written.",
      ],
      practice: [
        { q: "(4 + 6) × 3 − 7", a: "23" },
        { q: "(9 + 2) × 5 − 20", a: "35" },
        { q: "(3 + 8) × 7 − 11", a: "66" },
        { q: "(12 + 5) × 2 − 9", a: "25" },
        { q: "(6 + 6) × 4 − 18", a: "30" },
      ],
    },
    {
      title: "Exponents and division in the mix",
      intro: "The full ordering, in two shapes: something like 6 + 4 × (9 − 5)², where an exponent sits between the brackets and the multiplication, and (7 × 6 − 12) ÷ 5, where a whole calculation hides inside a bracket before you may divide.",
      sections: [
        {
          heading: "Where exponents rank",
          paras: [
            "Second. After brackets, before multiplication and division. So in 4 × (9 − 5)² you resolve the bracket, then square it, and only then multiply.",
            "The square attaches to the bracket alone, not to the 4 in front of it. (9 − 5)² is 16; it is not 4 × 4 squared.",
          ],
          example: { q: "6 + 4 × (9 − 5)²", steps: ["Bracket: 9 − 5 = 4.", "Exponent: 4² = 16.", "Multiply: 4 × 16 = 64.", "Add: 6 + 64."], a: "70" },
        },
        {
          heading: "A calculation inside a bracket",
          paras: [
            "In (7 × 6 − 12) ÷ 5 the bracket holds two operations of its own. Rank them inside the bracket exactly as you would outside it: the multiplication first, then the subtraction.",
            "The division waits for all of that. Nothing outside a bracket happens until the inside is a single number.",
          ],
          example: { q: "(7 × 6 − 12) ÷ 5", steps: ["Inside the bracket, multiply first: 7 × 6 = 42.", "Still inside: 42 − 12 = 30.", "Now the bracket is one number, so divide: 30 ÷ 5."], a: "6" },
        },
        {
          heading: "Equal rank means left to right",
          paras: [
            "Multiplication does not beat division, and addition does not beat subtraction. They sit on the same rung, and same-rung operations run left to right.",
            "So 20 ÷ 5 × 2 is 4 × 2 = 8, not 20 ÷ 10 = 2. The mnemonic people learn as “BEDMAS” hides this, because the D and M are really one step.",
          ],
        },
        {
          heading: "Keeping track",
          paras: [
            "With four ranks in play, the rewrite-each-line habit stops being optional. One line per resolved piece.",
            "10 + 3 × (6 − 2)², then 10 + 3 × 4², then 10 + 3 × 16, then 10 + 48, then 58. Every line is simpler than the one above it.",
          ],
          example: { q: "10 + 3 × (6 − 2)²", steps: ["Bracket: 6 − 2 = 4.", "Exponent: 4² = 16.", "Multiply: 3 × 16 = 48.", "Add: 10 + 48."], a: "58" },
        },
      ],
      mistakes: [
        "Applying the exponent to the number in front of the bracket as well as the bracket.",
        "Dividing by the 5 before the bracket has been reduced to a single number.",
        "Reading the mnemonic as though division ranks below multiplication, when they are equal and run left to right.",
      ],
      recap: [
        "Brackets, exponents, × and ÷ together, + and − together.",
        "Same rank runs left to right.",
        "Operations inside a bracket follow the same ranking, just earlier.",
        "One line per step; never two at once.",
      ],
      practice: [
        { q: "3 + 2 × (7 − 4)²", a: "21" },
        { q: "5 + 6 × (8 − 6)²", a: "29" },
        { q: "(9 × 4 − 6) ÷ 5", a: "6" },
        { q: "(8 × 7 − 11) ÷ 9", a: "5" },
        { q: "10 + 3 × (6 − 2)²", a: "58" },
      ],
    },
  ],

  // ---- Silver · Exponents --------------------------------------------------
  exponents: [
    {
      title: "Squares and cubes",
      intro: "Questions like 7² and 4³ — a small number raised to the power 2 or 3. The notation is compact and easy to misread, so it is worth being precise about what it means before speeding up.",
      sections: [
        {
          heading: "What the little number counts",
          paras: [
            "In 4³ the 4 is the base and the 3 is the exponent. The exponent counts how many copies of the base get multiplied: 4 × 4 × 4.",
            "It counts copies, not multiplications. 4³ has three fours in it and only two multiplication signs — which is why counting the copies is the safer way to read it.",
          ],
          example: { q: "4³", steps: ["Three copies of 4 multiplied: 4 × 4 × 4.", "4 × 4 = 16.", "16 × 4 = 64."], a: "64" },
        },
        {
          heading: "Squared and cubed",
          paras: [
            "Power 2 is called squaring, because n² is the area of a square with side n. Power 3 is cubing, for the same reason in three dimensions.",
            "Those names are worth attaching to the pictures. A square of side 7 holds 49 unit squares, which is exactly what 7² means.",
          ],
        },
        {
          heading: "The ones to know by heart",
          paras: [
            "The squares from 1 to 15 come up constantly, here and in every tier above: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225.",
            "The cubes are shorter and just as useful: 8, 27, 64, 125, 216, 343, 512, 729, 1000. Knowing 64 is both 8² and 4³ saves time more often than you would expect.",
          ],
        },
        {
          heading: "Work outward one step at a time",
          paras: [
            "For anything you have not memorised, multiply in stages and write each stage down. 9³ is 9 × 9 = 81, then 81 × 9 = 729.",
            "The mistake is doing it all at once in your head. These numbers grow fast, and a slip at the second step is invisible.",
          ],
        },
      ],
      mistakes: [
        "Multiplying the base by the exponent: 3⁴ answered as 12 rather than 81. This is by far the most common error with powers.",
        "Losing a copy — computing 4³ as 4 × 4 = 16 because there are only two multiplication signs.",
        "Confusing 2³ and 3² . They are 8 and 9, close enough to slip past unnoticed.",
      ],
      recap: [
        "The exponent counts copies of the base, not multiplications.",
        "Power 2 is squaring, power 3 is cubing.",
        "Learn the squares to 15 and the cubes to 10 — they are used everywhere later.",
        "Multiply in stages and write each stage down.",
      ],
      practice: [
        { q: "3^2", a: "9" },
        { q: "6^2", a: "36" },
        { q: "2^3", a: "8" },
        { q: "5^3", a: "125" },
        { q: "9^2", a: "81" },
      ],
    },
    {
      title: "Square roots and cube roots",
      intro: "√196 and ∛343. A root runs a power backwards: instead of being given the base and asked for the answer, you are given the answer and asked for the base.",
      sections: [
        {
          heading: "A root undoes a power",
          paras: [
            "√49 asks: what number, squared, gives 49? Seven. ∛125 asks: what number, cubed, gives 125? Five.",
            "So every root question is a power question you already know, read from the other end. If your squares and cubes are solid, roots cost you nothing extra.",
          ],
        },
        {
          heading: "The squares, as a lookup table",
          paras: [
            "The numbers here go up to 20², so the useful list runs: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400.",
            "Reading that list backwards is the whole method. √196 sits fourteenth, so the answer is 14.",
          ],
          example: { q: "√196", steps: ["Which square is 196? Count up: 12² = 144, 13² = 169, 14² = 196.", "So the root is 14."], a: "14" },
        },
        {
          heading: "The cubes",
          paras: [
            "Cubes here go up to 10³, so the list is short: 8, 27, 64, 125, 216, 343, 512, 729, 1000.",
            "They spread out fast, which makes them easy to identify. Nothing else is near 343, so recognising it as 7³ is immediate once you have seen the list a few times.",
          ],
          example: { q: "∛343", steps: ["The cubes run 8, 27, 64, 125, 216, 343.", "343 is the sixth, so the base is 7."], a: "7" },
        },
        {
          heading: "Narrowing down an unfamiliar one",
          paras: [
            "If a number is not one you recognise, bracket it. For √361: 18² = 324 is too small and 20² = 400 is too big, so the answer is 19.",
            "The last digit helps too. A square ending in 1 has a root ending in 1 or 9; one ending in 5 has a root ending in 5; one ending in 6 has a root ending in 4 or 6.",
          ],
        },
      ],
      mistakes: [
        "Halving instead of rooting: √36 answered as 18.",
        "Mixing up which root is asked for — ∛64 is 4, but √64 is 8, and the same number appears in both lists.",
        "Guessing without bracketing, when two quick squares would have pinned it down.",
      ],
      recap: [
        "A root is a power read backwards.",
        "Learn the squares to 20 and the cubes to 10 as lists you can scan.",
        "Bracket an unfamiliar number between two squares you do know.",
        "The final digit narrows the candidates fast.",
      ],
      practice: [
        { q: "√144", a: "12" },
        { q: "√225", a: "15" },
        { q: "∛64", a: "4" },
        { q: "∛512", a: "8" },
        { q: "√361", a: "19" },
      ],
    },
    {
      title: "Solving for the exponent",
      intro: "Questions of the form “solve 3^x = 243”. The base and the answer are given; the exponent is what is missing. The bases used are 2, 3, 5 and 10.",
      sections: [
        {
          heading: "Reading the question",
          paras: [
            "3^x = 243 asks how many threes you have to multiply together to reach 243. Not what to multiply 3 by — how many times to use it.",
            "That distinction is the whole level. The answer is a small counting number, almost always under 10, even when the target looks enormous.",
          ],
        },
        {
          heading: "Build the ladder",
          paras: [
            "Write out the powers of the base until you hit the target, and count the rungs. It is quick, it never fails, and it leaves a record you can check.",
            "Powers of 3: 3, 9, 27, 81, 243. That is five, so x = 5.",
          ],
          example: { q: "Solve 3^x = 243", steps: ["3¹ = 3, 3² = 9, 3³ = 27, 3⁴ = 81, 3⁵ = 243.", "243 is the fifth rung."], a: "5" },
        },
        {
          heading: "The four ladders you need",
          paras: [
            "Powers of 2: 2, 4, 8, 16, 32, 64, 128, 256. Powers of 3: 3, 9, 27, 81, 243. Powers of 5: 5, 25, 125, 625.",
            "Powers of 10 are free — the exponent is just the number of zeros. 10^x = 10000 has four zeros, so x = 4.",
          ],
          example: { q: "Solve 2^x = 128", steps: ["2, 4, 8, 16, 32, 64, 128.", "Count the rungs: seven."], a: "7" },
        },
        {
          heading: "Doubling your way up",
          paras: [
            "For base 2 you do not need the list memorised, because each rung is double the last. Start at 2 and keep doubling until you arrive, counting as you go.",
            "The same trick works for any base — each rung is the previous one times the base — which is why building the ladder is reliable even for a base you rarely use.",
          ],
        },
      ],
      mistakes: [
        "Answering with the base or with a division: 3^x = 243 answered as 81, which is 243 ÷ 3.",
        "Starting the count at 0, so every answer comes out one too small.",
        "Counting the number of zeros for a base that is not 10.",
      ],
      recap: [
        "The question asks how many copies of the base are needed.",
        "Write the powers out in order and count the rungs.",
        "Know the ladders for 2, 3 and 5; base 10 is just counting zeros.",
        "Each rung is the previous one times the base.",
      ],
      practice: [
        { q: "Solve 2^x = 64", a: "6" },
        { q: "Solve 3^x = 81", a: "4" },
        { q: "Solve 5^x = 125", a: "3" },
        { q: "Solve 10^x = 10000", a: "4" },
        { q: "Solve 2^x = 256", a: "8" },
      ],
    },
  ],

  // ---- Silver · Linear Equations -------------------------------------------
  linear: [
    {
      title: "One-step-at-a-time equations",
      intro: "Equations like 5x + 7 = 32. There is one x, it appears once, and the job is to get it alone on its side of the equals sign.",
      sections: [
        {
          heading: "What solving means",
          paras: [
            "5x + 7 = 32 is a claim that becomes true for exactly one value of x. Solving is finding it.",
            "So every solution can be checked, and should be. Put your answer back into the original equation and see whether both sides really match.",
          ],
        },
        {
          heading: "The balance rule",
          paras: [
            "An equation is a balance. Whatever you do to one side you must do to the other, or the two sides stop being equal and everything after that is wrong.",
            "Subtract 7 from the left and you must subtract 7 from the right. This single rule is the whole of equation solving; the rest is deciding what to do.",
          ],
        },
        {
          heading: "Undo in reverse order",
          paras: [
            "To build 5x + 7 from x you multiply by 5, then add 7. To take it apart you go backwards: undo the +7 first, then undo the ×5.",
            "Last thing on is first thing off. Doing it in the written order — dividing by 5 while the +7 is still there — creates fractions and usually a wrong answer.",
          ],
          example: { q: "Solve 5x + 7 = 32", steps: ["Undo the +7: subtract 7 from both sides, giving 5x = 25.", "Undo the ×5: divide both sides by 5.", "Check: 5 × 5 + 7 = 32."], a: "x = 5" },
        },
        {
          heading: "Subtraction and negatives",
          paras: [
            "4x − 9 = 19 works the same way: undo the −9 by adding 9 to both sides, giving 4x = 28, then divide.",
            "Whatever the sign, you are undoing it — a minus is undone by adding, a plus by subtracting.",
          ],
          example: { q: "Solve 4x − 9 = 19", steps: ["Undo the −9: add 9 to both sides, giving 4x = 28.", "Divide both sides by 4.", "Check: 4 × 7 − 9 = 19."], a: "x = 7" },
        },
      ],
      mistakes: [
        "Doing something to only one side, which quietly breaks the equation.",
        "Dividing by the coefficient before clearing the constant.",
        "Undoing a subtraction by subtracting again instead of adding.",
      ],
      recap: [
        "One value of x makes the equation true; find it and check it.",
        "Whatever you do, do to both sides.",
        "Undo in reverse: constants first, then the coefficient.",
        "Substitute your answer back into the original.",
      ],
      practice: [
        { q: "Solve 3x + 5 = 20", a: "x = 5" },
        { q: "Solve 7x − 4 = 24", a: "x = 4" },
        { q: "Solve 6x + 11 = 47", a: "x = 6" },
        { q: "Solve 2x − 13 = 5", a: "x = 9" },
        { q: "Solve 9x + 8 = 80", a: "x = 8" },
      ],
    },
    {
      title: "x on both sides",
      intro: "Equations like 7x + 3 = 4x + 18. There is now an x term on each side, so before you can undo anything you have to gather them together.",
      sections: [
        {
          heading: "Collect the x terms first",
          paras: [
            "You cannot divide by the coefficient while x appears in two places. The first move is always to get all the x onto one side.",
            "Subtracting 4x from both sides removes it from the right and reduces the left: 7x + 3 = 4x + 18 becomes 3x + 3 = 18. The balance rule is doing the work, exactly as before.",
          ],
        },
        {
          heading: "Which side to collect on",
          paras: [
            "Move the smaller x term. Taking 4x off both sides leaves 3x, which is positive and easy to work with. Taking 7x off instead would leave −3x on the right and a negative to juggle.",
            "Either choice reaches the same answer, so this is about avoiding avoidable slips rather than correctness.",
          ],
          example: { q: "Solve 7x + 3 = 4x + 18", steps: ["Subtract 4x from both sides: 3x + 3 = 18.", "Subtract 3: 3x = 15.", "Divide by 3.", "Check: 7 × 5 + 3 = 38 and 4 × 5 + 18 = 38."], a: "x = 5" },
        },
        {
          heading: "Then it is a level 1 problem",
          paras: [
            "Once x is in one place, nothing new remains. Clear the constant, divide by the coefficient, done.",
            "It is worth seeing that clearly: this level adds exactly one move to the front of a procedure you already know.",
          ],
        },
        {
          heading: "Negative answers are fine",
          paras: [
            "Nothing guarantees x is positive. In 2x − 5 = 6x + 11, collecting gives −16 = 4x, so x = −4.",
            "The check still works and is worth doing: both sides come out as −13. An answer being negative is not a sign that you went wrong.",
          ],
          example: { q: "Solve 2x − 5 = 6x + 11", steps: ["Subtract 2x from both sides: −5 = 4x + 11.", "Subtract 11: −16 = 4x.", "Divide by 4.", "Check: 2 × (−4) − 5 = −13 and 6 × (−4) + 11 = −13."], a: "x = −4" },
        },
      ],
      mistakes: [
        "Dividing by a coefficient while x is still on both sides.",
        "Moving an x term across without changing its sign.",
        "Rejecting a negative answer as impossible and hunting for a mistake that is not there.",
      ],
      recap: [
        "Gather the x terms onto one side before anything else.",
        "Move the smaller x term to keep the coefficient positive.",
        "After that it is an ordinary one-x equation.",
        "Check by substituting into both sides of the original.",
      ],
      practice: [
        { q: "Solve 5x + 2 = 3x + 12", a: "x = 5" },
        { q: "Solve 8x − 1 = 5x + 14", a: "x = 5" },
        { q: "Solve 4x + 9 = 7x − 6", a: "x = 5" },
        { q: "Solve 2x + 7 = 6x − 5", a: "x = 3" },
        { q: "Solve 9x − 4 = 3x + 20", a: "x = 4" },
      ],
    },
    {
      title: "Equations with brackets",
      intro: "Equations like 4(x − 3) = 6x + 2. A bracket has appeared on one side. Expand it first and the problem turns straight back into one you have already solved.",
      sections: [
        {
          heading: "Expand the bracket",
          paras: [
            "4(x − 3) means 4 lots of everything inside: 4 × x and 4 × (−3), giving 4x − 12.",
            "The multiplier reaches every term in the bracket, not just the first. Multiplying only the x is the single most common error at this level.",
          ],
        },
        {
          heading: "Mind the signs",
          paras: [
            "3(x − 4) is 3x − 12, not 3x + 12. The minus belongs to the 4 and survives the multiplication.",
            "Write the sign down with its number as you expand. Treating the bracket as “x minus 4” rather than “x plus negative 4” is where signs get dropped.",
          ],
        },
        {
          heading: "Then collect and solve",
          paras: [
            "Once the bracket is gone you have x on both sides, which is exactly level 2. Gather the x terms, clear the constant, divide.",
            "Check against the original bracket form, not your expanded version — that way a mistake in the expansion is caught rather than confirmed.",
          ],
          example: { q: "Solve 4(x − 3) = 6x + 2", steps: ["Expand: 4x − 12 = 6x + 2.", "Subtract 4x: −12 = 2x + 2.", "Subtract 2: −14 = 2x.", "Divide by 2. Check in the original: 4(−7 − 3) = −40 and 6(−7) + 2 = −40."], a: "x = −7" },
        },
        {
          heading: "A worked positive case",
          paras: [
            "Not every answer is negative. 5(x + 2) = 3x + 16 expands to 5x + 10 = 3x + 16, so 2x = 6 and x = 3.",
            "Checking in the original: 5(3 + 2) = 25, and 3 × 3 + 16 = 25. Both sides agree.",
          ],
          example: { q: "Solve 5(x + 2) = 3x + 16", steps: ["Expand: 5x + 10 = 3x + 16.", "Subtract 3x: 2x + 10 = 16.", "Subtract 10: 2x = 6.", "Divide by 2."], a: "x = 3" },
        },
      ],
      mistakes: [
        "Multiplying only the first term inside the bracket.",
        "Losing the minus sign when expanding something like 4(x − 3).",
        "Checking against your expanded line instead of the original equation, so an expansion error goes unnoticed.",
      ],
      recap: [
        "Expand the bracket before anything else.",
        "The multiplier hits every term inside, sign included.",
        "Then gather the x terms and finish as at level 2.",
        "Always check in the original bracket form.",
      ],
      practice: [
        { q: "Solve 3(x + 4) = 5x + 2", a: "x = 5" },
        { q: "Solve 2(x − 5) = 4x − 18", a: "x = 4" },
        { q: "Solve 6(x + 1) = 2x + 22", a: "x = 4" },
        { q: "Solve 4(x − 2) = x + 7", a: "x = 5" },
        { q: "Solve 5(x + 3) = 8x − 6", a: "x = 7" },
      ],
    },
  ],

  // ---- Gold · Area and Perimeter -------------------------------------------
  areaPerimeter: [
    {
      title: "Perimeter of squares and rectangles",
      intro: "How far it is around the outside of a shape. Questions give you a square's side or a rectangle's two dimensions and ask for the distance round the edge.",
      sections: [
        {
          heading: "Perimeter is a walk round the edge",
          paras: [
            "Put your finger on a corner and trace the whole way round until you are back where you started. The total distance travelled is the perimeter.",
            "That means you simply add up the side lengths. Every formula below is a shortcut for that addition, not a separate idea.",
          ],
        },
        {
          heading: "Rectangles",
          paras: [
            "A rectangle has two widths and two heights, so the perimeter is w + h + w + h — more usefully written 2(w + h).",
            "Add the two different sides first and double the result. For a 12 by 7 rectangle that is 19 doubled, which is 38.",
          ],
          example: { q: "Perimeter of a rectangle 12 by 7", steps: ["Add one width and one height: 12 + 7 = 19.", "Double it, because there are two of each."], a: "38" },
        },
        {
          heading: "Squares",
          paras: [
            "A square is a rectangle with all four sides the same, so its perimeter is 4s.",
            "A square with side 15 has perimeter 60. There is nothing else to it, but it is worth noticing that this is the same rule as the rectangle with w and h equal.",
          ],
          example: { q: "Perimeter of a square with side 15", steps: ["Four equal sides: 4 × 15."], a: "60" },
        },
        {
          heading: "Perimeter is a length",
          paras: [
            "Perimeter is measured in ordinary length units — centimetres, metres — never in square units. It is a distance, not a coverage.",
            "That is the quickest way to keep it apart from area, which is the next level and the thing it is most often confused with.",
          ],
        },
      ],
      mistakes: [
        "Multiplying the two sides instead of adding them, which gives the area.",
        "Doubling only one side: 12 by 7 answered as 12 + 7 = 19 or as 24.",
        "Reading a square's side as if it were a full perimeter already.",
      ],
      recap: [
        "Perimeter is the total distance round the edge.",
        "Rectangle: 2(w + h). Square: 4s.",
        "Add the two different sides, then double.",
        "It is a length, so never square units.",
      ],
      practice: [
        { q: "Perimeter of a rectangle 9 by 4", a: "26" },
        { q: "Perimeter of a square with side 11", a: "44" },
        { q: "Perimeter of a rectangle 20 by 13", a: "66" },
        { q: "Perimeter of a square with side 25", a: "100" },
        { q: "Perimeter of a rectangle 30 by 6", a: "72" },
      ],
    },
    {
      title: "Area of rectangles and triangles",
      intro: "How much space is inside a shape. Rectangles first, then triangles — and the triangle formula is simply half the rectangle it fits inside.",
      sections: [
        {
          heading: "Area counts squares",
          paras: [
            "A rectangle 5 by 3 can be cut into unit squares: five along each row, three rows. Fifteen squares, so area 15.",
            "That is what multiplying the sides is doing — counting rows of squares. Area comes out in square units, which is the visible difference from perimeter.",
          ],
          example: { q: "Area of a rectangle 14 by 9", steps: ["Fourteen squares in each row, nine rows.", "14 × 9."], a: "126" },
        },
        {
          heading: "Triangles are half a rectangle",
          paras: [
            "Draw a rectangle round a right-angled triangle and the triangle is exactly half of it. Slice any triangle down its height and the two halves rearrange into a rectangle just the same.",
            "So the area is ½ × base × height. The halving is not a fudge factor; it is the other half of the rectangle.",
          ],
          example: { q: "Area of a triangle with base 16 and height 7", steps: ["Half the base: 16 ÷ 2 = 8.", "Multiply by the height: 8 × 7."], a: "56" },
        },
        {
          heading: "Height means perpendicular height",
          paras: [
            "The height is the straight-up distance from the base to the opposite corner, measured at a right angle to the base. It is not the length of a slanted side.",
            "On a leaning triangle the height can even fall outside the shape. That is still the number you want.",
          ],
        },
        {
          heading: "Halve early, not late",
          paras: [
            "Halve whichever of the base or height is even before multiplying. A triangle with base 24 and height 5 becomes 12 × 5 = 60, which beats working out 120 and halving it.",
            "Small habit, fewer errors — and it keeps the numbers inside comfortable mental arithmetic.",
          ],
        },
      ],
      mistakes: [
        "Forgetting the ½ on a triangle, which doubles the answer.",
        "Using a slanted side as the height.",
        "Giving the perimeter when the question asked for area — read the word, not the shape.",
      ],
      recap: [
        "Area counts the unit squares inside, and is in square units.",
        "Rectangle: width × height.",
        "Triangle: ½ × base × height, because it is half its rectangle.",
        "Height is always perpendicular to the base.",
      ],
      practice: [
        { q: "Area of a rectangle 8 by 12", a: "96" },
        { q: "Area of a triangle with base 10 and height 9", a: "45" },
        { q: "Area of a rectangle 15 by 15", a: "225" },
        { q: "Area of a triangle with base 24 and height 5", a: "60" },
        { q: "Area of a rectangle 21 by 4", a: "84" },
      ],
    },
    {
      title: "Parallelograms and trapezoids",
      intro: "Two shapes with a pair of parallel sides. Both formulas come straight from the rectangle, once you see what is being rearranged.",
      sections: [
        {
          heading: "A parallelogram is a pushed-over rectangle",
          paras: [
            "Cut the triangle off one end of a parallelogram and slide it round to the other end: you have a rectangle, with the same base and the same height.",
            "Nothing was added or removed, so the area is the same — base × height. No halving, no extra factor.",
          ],
          example: { q: "Area of a parallelogram with base 13 and height 8", steps: ["Base times perpendicular height: 13 × 8."], a: "104" },
        },
        {
          heading: "A trapezoid averages its two bases",
          paras: [
            "A trapezoid has two parallel sides of different lengths. Its area is ½(b₁ + b₂) × h — the average of the two bases, times the height.",
            "It behaves like a rectangle whose width is halfway between the two. Wider at one end, narrower at the other, and the average is exactly right.",
          ],
          example: { q: "Area of a trapezoid with bases 6 and 10 and height 7", steps: ["Average the parallel sides: (6 + 10) ÷ 2 = 8.", "Multiply by the height: 8 × 7."], a: "56" },
        },
        {
          heading: "Why the average works",
          paras: [
            "Take a second copy of the trapezoid, turn it upside down, and push it against the first. The two together make a parallelogram with base b₁ + b₂ and height h.",
            "That double shape has area (b₁ + b₂) × h, so one trapezoid is half of it. The ½ in the formula is that halving.",
          ],
        },
        {
          heading: "Perpendicular height, again",
          paras: [
            "As with triangles, the height is the perpendicular distance between the two parallel sides — never the slanted edge.",
            "A question that offers you a slant length is usually offering it as a distractor. Use the one measured at a right angle.",
          ],
        },
      ],
      mistakes: [
        "Halving a parallelogram as though it were a triangle.",
        "Adding the trapezoid's bases but forgetting to halve, which doubles the answer.",
        "Using the slanted side as the height in either shape.",
      ],
      recap: [
        "Parallelogram: base × height, no halving.",
        "Trapezoid: average the two parallel sides, then times the height.",
        "The average works because two trapezoids make a parallelogram.",
        "Height is perpendicular in both cases.",
      ],
      practice: [
        { q: "Area of a parallelogram with base 9 and height 6", a: "54" },
        { q: "Area of a trapezoid with bases 4 and 8 and height 5", a: "30" },
        { q: "Area of a parallelogram with base 17 and height 4", a: "68" },
        { q: "Area of a trapezoid with bases 7 and 13 and height 6", a: "60" },
        { q: "Area of a trapezoid with bases 12 and 20 and height 9", a: "144" },
      ],
    },
  ],

  // ---- Gold · Distance -----------------------------------------------------
  distance: [
    {
      title: "Distance along a straight line",
      intro: "Two points that share an x or share a y, like (2, 7) and (11, 7). The line between them is perfectly horizontal or vertical, so the distance is a single subtraction.",
      sections: [
        {
          heading: "Reading a coordinate pair",
          paras: [
            "A point is written (x, y): how far across first, how far up second. (2, 7) is two right and seven up from the origin.",
            "Getting the order backwards is a habit worth breaking early, because everything above this level depends on it.",
          ],
        },
        {
          heading: "Same y means a horizontal line",
          paras: [
            "If both points have the same y, neither is higher than the other. The whole gap is sideways, so subtract the x values.",
            "From (2, 7) to (11, 7) the gap is 11 − 2 = 9. The 7 plays no part; it only tells you the line's height.",
          ],
          example: { q: "Distance between (−3, 5) and (9, 5)", steps: ["Both have y = 5, so the line is horizontal.", "Subtract the x values: 9 − (−3) = 12."], a: "12" },
        },
        {
          heading: "Same x means a vertical line",
          paras: [
            "The mirror image: if the x values match, subtract the y values instead.",
            "From (4, −2) to (4, 6) the distance is 6 − (−2) = 8. Subtracting a negative adds, which is where this one usually goes wrong.",
          ],
          example: { q: "Distance between (4, −2) and (4, 6)", steps: ["Both have x = 4, so the line is vertical.", "Subtract the y values: 6 − (−2) = 6 + 2."], a: "8" },
        },
        {
          heading: "Distance is never negative",
          paras: [
            "Subtracting the other way round gives the same distance with a minus in front. Distance has no direction, so take the positive value however you got there.",
            "If you would rather not think about it, subtract the smaller from the larger and the question never arises.",
          ],
        },
      ],
      mistakes: [
        "Subtracting a negative as though it were a positive: 9 − (−3) treated as 6.",
        "Subtracting the coordinate that matches instead of the one that differs.",
        "Leaving the answer negative because of the order of subtraction.",
      ],
      recap: [
        "A point is (across, up).",
        "Matching y: subtract the x values. Matching x: subtract the y values.",
        "Subtracting a negative adds.",
        "Distance is always positive.",
      ],
      practice: [
        { q: "Distance between (2, 7) and (11, 7)", a: "9" },
        { q: "Distance between (−5, 1) and (3, 1)", a: "8" },
        { q: "Distance between (6, −4) and (6, 5)", a: "9" },
        { q: "Distance between (−8, 2) and (−8, −7)", a: "9" },
        { q: "Distance between (0, 3) and (14, 3)", a: "14" },
      ],
    },
    {
      title: "The distance formula",
      intro: "Now the two points differ in both coordinates, like (2, 3) and (7, 15). The straight line between them is slanted — and it is the hypotenuse of a right triangle you can draw yourself.",
      sections: [
        {
          heading: "Two points make a triangle",
          paras: [
            "Go across from the first point, then up to the second. Those two moves and the direct line between the points form a right-angled triangle.",
            "The across and up distances are the legs, and the direct line is the hypotenuse. So this is Pythagoras with the triangle hidden.",
          ],
        },
        {
          heading: "The formula",
          paras: [
            "distance = √((x₂ − x₁)² + (y₂ − y₁)²). Subtract to get each leg, square both, add, take the square root.",
            "Written out it looks fierce; in practice it is “across and up, then Pythagoras”, which is much easier to hold on to.",
          ],
          example: { q: "Distance between (2, 3) and (7, 15)", steps: ["Across: 7 − 2 = 5. Up: 15 − 3 = 12.", "Square and add: 25 + 144 = 169.", "Square root: √169."], a: "13" },
        },
        {
          heading: "Signs stop mattering",
          paras: [
            "Both differences get squared, and squaring kills the sign. So it makes no difference which point you call first.",
            "From (−1, 4) to (2, 8) the legs are 3 and 4 whichever way you subtract, and the distance is 5.",
          ],
          example: { q: "Distance between (−1, 4) and (2, 8)", steps: ["Across: 2 − (−1) = 3. Up: 8 − 4 = 4.", "Square and add: 9 + 16 = 25.", "Square root."], a: "5" },
        },
        {
          heading: "Learn to spot the triples",
          paras: [
            "The questions at this level are built from three right triangles: 3-4-5, 5-12-13 and 8-15-17. Recognising the legs saves you the squaring entirely.",
            "See legs of 8 and 15 and you can write 17 without touching the arithmetic. It is worth memorising all three.",
          ],
        },
      ],
      mistakes: [
        "Forgetting the square root and giving 169 instead of 13.",
        "Subtracting an x from a y — keep the across values together and the up values together.",
        "Adding the legs rather than squaring them first.",
      ],
      recap: [
        "Two points make a right triangle: across, up, and the direct line.",
        "distance = √(across² + up²).",
        "Squaring removes the signs, so subtraction order is free.",
        "Know 3-4-5, 5-12-13 and 8-15-17 on sight.",
      ],
      practice: [
        { q: "Distance between (0, 0) and (3, 4)", a: "5" },
        { q: "Distance between (1, 2) and (9, 17)", a: "17" },
        { q: "Distance between (−2, 5) and (3, 17)", a: "13" },
        { q: "Distance between (4, 4) and (0, 1)", a: "5" },
        { q: "Distance between (6, −3) and (14, 12)", a: "17" },
      ],
    },
    {
      title: "Scaled triangles and bigger numbers",
      intro: "The same formula, but the legs are now multiples of a familiar triple — 10 and 24, or 27 and 36. Squaring those directly is painful, and there is almost always a shortcut.",
      sections: [
        {
          heading: "Multiples of a triple are still triples",
          paras: [
            "Double every side of a 5-12-13 triangle and you get 10-24-26. The shape is identical, just larger, so it is still right-angled.",
            "That means any common factor in the legs can be pulled out, dealt with at small numbers, and multiplied back at the end.",
          ],
        },
        {
          heading: "Factor out, solve small, scale back",
          paras: [
            "Legs of 10 and 24 share a factor of 2. Divide to get 5 and 12, recognise the triple, take the 13 — then multiply back by 2 for 26.",
            "You have replaced squaring 24 with squaring 12, and squaring 12 with recognising a triple you already know.",
          ],
          example: { q: "Distance between (1, 2) and (11, 26)", steps: ["Across: 10. Up: 24.", "Both divide by 2, giving 5 and 12 — the 5-12-13 triangle.", "Scale the 13 back up by 2."], a: "26" },
        },
        {
          heading: "Larger factors",
          paras: [
            "Legs of 27 and 36 share a factor of 9. Dividing gives 3 and 4, so the hypotenuse of the small triangle is 5, and the real answer is 45.",
            "It is worth spending a moment looking for the factor before reaching for the squares. 27² + 36² = 729 + 1296 = 2025, and recognising √2025 as 45 is much harder than spotting the 3-4-5.",
          ],
          example: { q: "Distance between (1, 1) and (28, 37)", steps: ["Across: 27. Up: 36.", "Both divide by 9, giving 3 and 4 — the 3-4-5 triangle.", "Scale the 5 back up by 9."], a: "45" },
        },
        {
          heading: "When there is no common factor",
          paras: [
            "Some triples are not scaled versions of the small ones: 20-21-29 and 9-40-41 among them. If the legs share no factor, do it longhand.",
            "20² + 21² = 400 + 441 = 841, and √841 = 29. Slower, but always available when the shortcut is not.",
          ],
        },
      ],
      mistakes: [
        "Dividing the legs by a factor and forgetting to multiply the answer back up.",
        "Scaling the hypotenuse by the wrong factor, or by the factor squared.",
        "Assuming every pair of legs must reduce, when some triples have no common factor.",
      ],
      recap: [
        "Any multiple of a right triangle is still a right triangle.",
        "Take out a common factor, use the small triple, multiply back.",
        "Scale the hypotenuse by the same factor — not its square.",
        "No common factor means squaring it out longhand.",
      ],
      practice: [
        { q: "Distance between (0, 0) and (6, 8)", a: "10" },
        { q: "Distance between (2, 1) and (12, 25)", a: "26" },
        { q: "Distance between (−3, 2) and (13, 32)", a: "34" },
        { q: "Distance between (5, 5) and (25, 26)", a: "29" },
        { q: "Distance between (1, 1) and (28, 37)", a: "45" },
      ],
    },
  ],

  // ---- Gold · Circles ------------------------------------------------------
  circles: [
    {
      title: "Circumference",
      intro: "The distance round a circle. Questions give you a radius or a diameter and want the answer in terms of π — so 18pi, not 56.5.",
      sections: [
        {
          heading: "Radius, diameter, circumference",
          paras: [
            "The radius runs from the centre to the edge. The diameter runs right across through the centre, so it is always twice the radius: d = 2r.",
            "The circumference is the distance all the way round — the circle's perimeter. Almost every mistake in this topic is a radius-diameter mix-up, so read which one you were given.",
          ],
        },
        {
          heading: "The formula",
          paras: [
            "C = 2πr, or equivalently C = πd. They are the same statement, because 2r is the diameter.",
            "Use whichever matches what the question gave you. Given a radius, double it and attach π. Given a diameter, attach π directly.",
          ],
          example: { q: "Circumference of a circle with radius 9", steps: ["C = 2πr, so double the radius: 2 × 9 = 18.", "Attach π."], a: "18pi" },
        },
        {
          heading: "Answers in terms of π",
          paras: [
            "Leaving π as a symbol keeps the answer exact. 18π is the true circumference; 56.548… is a rounded decimal that is never quite right.",
            "So do all the arithmetic on the number in front and leave π alone at the end. Write it as 18pi in the answer box.",
          ],
        },
        {
          heading: "Starting from a diameter",
          paras: [
            "If the question gives a diameter of 14, the circumference is simply 14π. There is no doubling to do — that was already done for you.",
            "Doubling a diameter out of habit is the single most common slip here, and it gives exactly twice the right answer.",
          ],
          example: { q: "Circumference of a circle with diameter 14", steps: ["C = πd, and the diameter is already given.", "So the answer is 14π — no doubling."], a: "14pi" },
        },
      ],
      mistakes: [
        "Doubling a diameter that was already a diameter.",
        "Using a radius directly in C = πd without doubling it first.",
        "Turning π into 3.14 when the question asked for an exact answer.",
      ],
      recap: [
        "d = 2r. Read carefully which one you were given.",
        "C = 2πr, or C = πd — the same rule.",
        "Do the arithmetic on the number and leave π as a symbol.",
        "A given diameter needs no doubling.",
      ],
      practice: [
        { q: "Circumference of a circle with radius 5", a: "10pi" },
        { q: "Circumference of a circle with radius 12", a: "24pi" },
        { q: "Circumference of a circle with diameter 20", a: "20pi" },
        { q: "Circumference of a circle with radius 7", a: "14pi" },
        { q: "Circumference of a circle with diameter 6", a: "6pi" },
      ],
    },
    {
      title: "Area of a circle",
      intro: "The space inside the circle, A = πr². Same two inputs as before, one crucial difference: the radius gets squared, not doubled.",
      sections: [
        {
          heading: "The formula",
          paras: [
            "A = πr². Square the radius, then attach π. A circle of radius 6 has area 36π.",
            "Squaring rather than doubling is the whole distinction from circumference, and it is where nearly every error at this level comes from.",
          ],
          example: { q: "Area of a circle with radius 6", steps: ["Square the radius: 6² = 36.", "Attach π."], a: "36pi" },
        },
        {
          heading: "Circumference or area?",
          paras: [
            "2πr and πr² look similar and mean very different things. The first is a distance round the edge; the second is a coverage inside.",
            "A quick check: for any radius above 2, the area number is larger than the circumference number. Radius 6 gives circumference 12π and area 36π.",
          ],
        },
        {
          heading: "Starting from a diameter",
          paras: [
            "If a diameter is given, halve it before squaring. A diameter of 10 means a radius of 5, so the area is 25π.",
            "Squaring the diameter instead gives 100π — four times too big. Halve first, always.",
          ],
          example: { q: "Area of a circle with diameter 10", steps: ["Halve the diameter to get the radius: 10 ÷ 2 = 5.", "Square it: 5² = 25.", "Attach π."], a: "25pi" },
        },
        {
          heading: "Why it is squared",
          paras: [
            "Area is a two-dimensional measure, so it always involves two lengths multiplied together — width times height for a rectangle, r times r here.",
            "That is a useful sanity check across the whole topic: anything measuring space has two lengths in it, and anything measuring a distance has one.",
          ],
        },
      ],
      mistakes: [
        "Doubling the radius instead of squaring it, giving the circumference by accident.",
        "Squaring a diameter without halving it first, which quadruples the answer.",
        "Squaring π along with the radius.",
      ],
      recap: [
        "A = πr².",
        "Square the radius — never double it.",
        "Given a diameter, halve it before squaring.",
        "Area has two lengths in it; circumference has one.",
      ],
      practice: [
        { q: "Area of a circle with radius 3", a: "9pi" },
        { q: "Area of a circle with radius 8", a: "64pi" },
        { q: "Area of a circle with diameter 12", a: "36pi" },
        { q: "Area of a circle with radius 11", a: "121pi" },
        { q: "Area of a circle with diameter 4", a: "4pi" },
      ],
    },
    {
      title: "Working backwards from area or circumference",
      intro: "The question now hands you the answer and asks for the radius or diameter: “a circle has area 81π — what is its radius?” Same two formulas, run in reverse.",
      sections: [
        {
          heading: "Undo the formula",
          paras: [
            "If A = πr² and the area is 81π, then πr² = 81π. The π on both sides cancels, leaving r² = 81, so r = 9.",
            "The π never causes trouble in these questions precisely because it appears on both sides. Cancel it and you are left with plain arithmetic.",
          ],
          example: { q: "A circle has area 64π. What is its radius?", steps: ["πr² = 64π, so r² = 64.", "Take the square root."], a: "8" },
        },
        {
          heading: "From a circumference",
          paras: [
            "C = πd, so a circumference of 30π means d = 30 straight away. If the question wants the radius instead, halve it to get 15.",
            "This is the step to slow down on. The formula naturally produces the diameter, and the question may want the other one.",
          ],
          example: { q: "A circle has circumference 30π. What is its diameter?", steps: ["C = πd, so πd = 30π.", "Cancel π: the diameter is 30."], a: "30" },
        },
        {
          heading: "Reverse the operations in reverse order",
          paras: [
            "Forwards, area is: halve the diameter, square it, attach π. Backwards it is: strip π, square-root it, double it — the same three steps, undone from the end.",
            "Writing the forward chain first makes the backward one obvious, and it is quicker than trying to remember a second set of rules.",
          ],
        },
        {
          heading: "Check by going forwards",
          paras: [
            "Take your answer and run the original formula on it. If you said the radius is 9, then πr² = 81π, which matches the question.",
            "That check costs one line and catches every radius-diameter confusion.",
          ],
        },
      ],
      mistakes: [
        "Halving the area instead of square-rooting it.",
        "Giving a radius when the question asked for a diameter, or the other way round.",
        "Trying to divide by π numerically instead of just cancelling it.",
      ],
      recap: [
        "π cancels from both sides — it never needs computing.",
        "From area: r² = the number, so square-root it.",
        "From circumference: the number is the diameter; halve it for the radius.",
        "Check by running the formula forwards on your answer.",
      ],
      practice: [
        { q: "A circle has area 81pi. What is its radius?", a: "9" },
        { q: "A circle has area 144pi. What is its radius?", a: "12" },
        { q: "A circle has circumference 22pi. What is its diameter?", a: "22" },
        { q: "A circle has circumference 16pi. What is its diameter?", a: "16" },
        { q: "A circle has area 25pi. What is its radius?", a: "5" },
      ],
    },
  ],

  // ---- Gold · Pythagorean Theorem ------------------------------------------
  pythagorean: [
    {
      title: "Finding the hypotenuse",
      intro: "A right triangle's two short sides are given and you want the long one. This is the theorem in its most direct form: square, add, square-root.",
      sections: [
        {
          heading: "Naming the sides",
          paras: [
            "A right triangle has one 90° corner. The side opposite that corner is the hypotenuse, and it is always the longest of the three.",
            "The other two are the legs. Identifying the hypotenuse before you start is what keeps you from adding when you should subtract, which matters from the next level onwards.",
          ],
        },
        {
          heading: "The theorem",
          paras: [
            "a² + b² = c², where a and b are the legs and c is the hypotenuse. The squares on the two short sides add up to the square on the long one.",
            "So: square both legs, add them, and square-root the total. Three steps, in that order, every time.",
          ],
          example: { q: "A right triangle has legs 8 and 15. Hypotenuse?", steps: ["Square both legs: 64 and 225.", "Add: 64 + 225 = 289.", "Square root: √289."], a: "17" },
        },
        {
          heading: "The triples worth memorising",
          paras: [
            "The questions here are built from four right triangles with whole-number sides: 3-4-5, 5-12-13, 8-15-17 and 7-24-25.",
            "Recognising one on sight skips all three steps. Legs of 7 and 24 mean 25, with no squaring at all — and 24² = 576 is not a number you want to compute under time pressure.",
          ],
          example: { q: "A right triangle has legs 7 and 24. Hypotenuse?", steps: ["Square both: 49 and 576.", "Add: 625.", "Square root: √625. (Or recognise the 7-24-25 triple and skip straight here.)"], a: "25" },
        },
        {
          heading: "Sanity checks",
          paras: [
            "The hypotenuse must be longer than either leg, and shorter than the two added together. For legs 8 and 15 that means somewhere between 15 and 23 — and 17 fits.",
            "That range catches the two classic errors instantly: forgetting the square root gives 289, and adding the legs gives 23.",
          ],
        },
      ],
      mistakes: [
        "Forgetting the final square root, so the answer is the squared value.",
        "Adding the legs without squaring: 8 + 15 given as 23.",
        "Squaring the sum instead of summing the squares — (8 + 15)² is not 8² + 15².",
      ],
      recap: [
        "The hypotenuse is opposite the right angle and is the longest side.",
        "a² + b² = c²: square, add, square-root.",
        "Learn 3-4-5, 5-12-13, 8-15-17 and 7-24-25 on sight.",
        "The answer sits between the longer leg and the sum of both legs.",
      ],
      practice: [
        { q: "A right triangle has legs 3 and 4. Hypotenuse?", a: "5" },
        { q: "A right triangle has legs 5 and 12. Hypotenuse?", a: "13" },
        { q: "A right triangle has legs 8 and 15. Hypotenuse?", a: "17" },
        { q: "A right triangle has legs 7 and 24. Hypotenuse?", a: "25" },
        { q: "A right triangle has legs 12 and 5. Hypotenuse?", a: "13" },
      ],
    },
    {
      title: "Finding a missing leg",
      intro: "This time the hypotenuse is given along with one leg, and the other leg is missing. Same theorem, rearranged — and the rearrangement turns the addition into a subtraction.",
      sections: [
        {
          heading: "Rearranging the theorem",
          paras: [
            "Start from a² + b² = c². Take b² off both sides and you get a² = c² − b².",
            "So a missing leg is found by subtracting, not adding. Getting this backwards is the defining error of this level, and it always produces an answer larger than the hypotenuse.",
          ],
        },
        {
          heading: "Identify the hypotenuse first",
          paras: [
            "Before touching any arithmetic, work out which given number is the hypotenuse. It is the one opposite the right angle, and it is always the larger of the two you were given.",
            "Given 17 and 8, the 17 must be the hypotenuse — a leg cannot be longer than it. That single observation tells you to subtract.",
          ],
          example: { q: "Hypotenuse 17, one leg 8. Other leg?", steps: ["17 is the hypotenuse, so subtract: 17² − 8².", "289 − 64 = 225.", "Square root: √225."], a: "15" },
        },
        {
          heading: "Working with the big squares",
          paras: [
            "The numbers grow quickly: 25² is 625, and 24² is 576. Write each square down before subtracting rather than doing both in your head.",
            "Or use the triples. Seeing a hypotenuse of 25 and a leg of 24 should call up 7-24-25 immediately, and the answer is 7 with no arithmetic at all.",
          ],
          example: { q: "Hypotenuse 25, one leg 24. Other leg?", steps: ["25 is the hypotenuse: 25² − 24².", "625 − 576 = 49.", "Square root: √49."], a: "7" },
        },
        {
          heading: "Checking",
          paras: [
            "Put all three sides back into a² + b² = c². For 8, 15 and 17: 64 + 225 = 289, and 17² = 289. It holds.",
            "The range check works here too — a leg must be shorter than the hypotenuse. Any answer bigger than the hypotenuse means you added when you should have subtracted.",
          ],
        },
      ],
      mistakes: [
        "Adding the two given sides, which gives an impossible leg longer than the hypotenuse.",
        "Treating the larger given number as a leg.",
        "Subtracting the numbers before squaring them: (17 − 8)² is 81, not 225.",
      ],
      recap: [
        "Missing leg: a² = c² − b². Subtract, do not add.",
        "The hypotenuse is the larger given number.",
        "Square each side first, then subtract, then square-root.",
        "A leg must come out shorter than the hypotenuse.",
      ],
      practice: [
        { q: "Hypotenuse 5, one leg 3. Other leg?", a: "4" },
        { q: "Hypotenuse 13, one leg 5. Other leg?", a: "12" },
        { q: "Hypotenuse 17, one leg 15. Other leg?", a: "8" },
        { q: "Hypotenuse 25, one leg 7. Other leg?", a: "24" },
        { q: "Hypotenuse 13, one leg 12. Other leg?", a: "5" },
      ],
    },
    {
      title: "Scaled triples and word problems",
      intro: "The sides are now multiples of a familiar triple, and some questions arrive as sentences about ladders and walls rather than as labelled triangles.",
      sections: [
        {
          heading: "Scaling a triple",
          paras: [
            "Multiply every side of 3-4-5 by 4 and you get 12-16-20 — still a right triangle, because scaling changes the size but not the shape.",
            "So the whole family 6-8-10, 9-12-15, 12-16-20, 15-20-25 comes free from one memorised triple.",
          ],
          example: { q: "A right triangle has legs 9 and 12. Hypotenuse?", steps: ["Both divide by 3, giving 3 and 4 — the 3-4-5 triangle.", "Its hypotenuse is 5, so scale back up by 3."], a: "15" },
        },
        {
          heading: "Spotting the factor",
          paras: [
            "Look for a common factor in the two given sides before reaching for the squares. Legs of 24 and 32 both divide by 8, leaving 3 and 4, so the answer is 5 × 8 = 40.",
            "Squaring 32 directly means handling 1024. Spotting the factor replaces that with a fact you already know.",
          ],
        },
        {
          heading: "Word problems: find the triangle",
          paras: [
            "A ladder leaning against a wall makes a right triangle: the wall is one leg, the ground from the wall to the foot of the ladder is the other, and the ladder itself is the hypotenuse.",
            "The ladder is always the hypotenuse, because it is opposite the right angle where wall meets ground. Once you have seen that, it is an ordinary missing-leg question.",
          ],
          example: { q: "A ladder 25 long leans against a wall, its foot 7 from the wall. How high does it reach?", steps: ["The ladder is the hypotenuse: 25. The ground distance is a leg: 7.", "Missing leg, so subtract: 625 − 49 = 576.", "Square root: √576."], a: "24" },
        },
        {
          heading: "When it is not a triple",
          paras: [
            "Not every triangle is a scaled version of a small one. If the sides share no factor and you do not recognise them, fall back to squaring it out longhand.",
            "The method never fails; the triples are a shortcut, not a requirement.",
          ],
        },
      ],
      mistakes: [
        "Dividing the legs by a common factor and forgetting to scale the answer back up.",
        "In a ladder problem, treating the wall or the ground as the hypotenuse.",
        "Adding when the word problem is really asking for a missing leg.",
      ],
      recap: [
        "Any multiple of a right triangle is still right-angled.",
        "Take out a common factor, use the small triple, scale the answer back.",
        "In a ladder problem the ladder is always the hypotenuse.",
        "No factor and no recognition means squaring it out longhand.",
      ],
      practice: [
        { q: "A right triangle has legs 15 and 20. Hypotenuse?", a: "25" },
        { q: "A right triangle has legs 24 and 32. Hypotenuse?", a: "40" },
        { q: "Hypotenuse 26, one leg 10. Other leg?", a: "24" },
        { q: "A ladder 13 long leans against a wall, its foot 5 from the wall. How high does it reach?", a: "12" },
        { q: "A right triangle has legs 21 and 28. Hypotenuse?", a: "35" },
      ],
    },
  ],

  // ---- Crystal · Circle Sectors --------------------------------------------
  sectors: [
    {
      title: "Area of a sector",
      intro: "A sector is a slice of a circle, cut from the centre — a pizza slice. You are given the angle at the point and the radius, and asked for the slice's area in terms of π.",
      sections: [
        {
          heading: "A sector keeps its share",
          paras: [
            "A full turn is 360°. A sector with a 90° angle takes up 90 out of those 360 degrees, so it is 90/360 of the circle — a quarter.",
            "That fraction is the entire idea. Work out what share of the circle you have, then take that share of the circle's area.",
          ],
        },
        {
          heading: "The fractions worth recognising",
          paras: [
            "The angles used here are 30°, 45°, 60°, 90°, 120°, 180° and 270°, and each is a clean fraction of the whole.",
            "180° is a half, 120° a third, 90° a quarter, 60° a sixth, 45° an eighth, 30° a twelfth, and 270° is three quarters. Knowing those on sight removes most of the arithmetic.",
          ],
        },
        {
          heading: "The method",
          paras: [
            "Work out the whole circle's area first, πr², then take the fraction. Doing it in that order keeps the numbers whole for as long as possible.",
            "For a 90° sector of radius 6: the circle is 36π, and a quarter of that is 9π.",
          ],
          example: { q: "Area of a 90° sector of a circle with radius 6", steps: ["90/360 = 1/4 of the circle.", "Whole circle: π × 6² = 36π.", "Take a quarter of it."], a: "9pi" },
        },
        {
          heading: "Keeping π symbolic",
          paras: [
            "As with plain circles, the answer stays exact. Do all the arithmetic on the number in front of π and write the result as 27pi.",
            "π never needs to be multiplied out. It rides along untouched from the formula to the answer.",
          ],
          example: { q: "Area of a 120° sector of a circle with radius 9", steps: ["120/360 = 1/3 of the circle.", "Whole circle: π × 9² = 81π.", "A third of 81 is 27."], a: "27pi" },
        },
      ],
      mistakes: [
        "Dividing by the angle instead of by 360 — a 90° sector is a quarter, not a ninetieth.",
        "Using the radius instead of the radius squared, which gives an arc length rather than an area.",
        "Taking the fraction of the radius before squaring, rather than of the finished area.",
      ],
      recap: [
        "A θ° sector is θ/360 of the whole circle.",
        "Find the full area πr² first, then take that fraction of it.",
        "Learn the common angles as fractions: 90° is a quarter, 120° a third, 45° an eighth.",
        "Leave π as a symbol.",
      ],
      practice: [
        { q: "Area of a 90° sector of a circle with radius 4", a: "4pi" },
        { q: "Area of a 180° sector of a circle with radius 6", a: "18pi" },
        { q: "Area of a 60° sector of a circle with radius 6", a: "6pi" },
        { q: "Area of a 45° sector of a circle with radius 4", a: "2pi" },
        { q: "Area of a 270° sector of a circle with radius 2", a: "3pi" },
      ],
    },
    {
      title: "Arc length",
      intro: "Same slice, different measurement. Arc length is the curved edge of the sector — the crust of the pizza slice — rather than the area inside it.",
      sections: [
        {
          heading: "The same fraction, a different whole",
          paras: [
            "The share of the circle is worked out exactly as before: θ/360. Nothing about that step changes.",
            "What changes is what you take a share of. For area it was πr²; for arc length it is the circumference, 2πr.",
          ],
        },
        {
          heading: "The formula",
          paras: [
            "Arc length = (θ/360) × 2πr. Find the whole circumference, then take the fraction.",
            "For a 120° sector of radius 9: the circumference is 18π, and a third of that is 6π. Note that the same sector had area 27π — the two numbers are different because they measure different things.",
          ],
          example: { q: "Arc length of a 120° sector of a circle with radius 9", steps: ["120/360 = 1/3.", "Whole circumference: 2π × 9 = 18π.", "A third of 18 is 6."], a: "6pi" },
        },
        {
          heading: "r or r², and how to keep them straight",
          paras: [
            "Arc length uses r, because it is a distance. Area uses r², because it is a space. That is the single distinction to hold on to in this topic.",
            "If you are unsure which the question wants, read the words rather than the numbers: “arc length” and “perimeter” are distances, “area” is a space.",
          ],
          example: { q: "Arc length of a 90° sector of a circle with radius 6", steps: ["90/360 = 1/4.", "Whole circumference: 2π × 6 = 12π.", "A quarter of 12 is 3."], a: "3pi" },
        },
        {
          heading: "A quick sanity check",
          paras: [
            "The arc is part of the circumference, so its number must be smaller than 2r — and for a half-circle, exactly r × π.",
            "A 180° sector of radius 7 has arc length 7π, exactly half of 14π. If your answer is bigger than the whole circumference, the fraction went in upside down.",
          ],
        },
      ],
      mistakes: [
        "Squaring the radius, which computes the area instead.",
        "Forgetting the 2 in 2πr and halving every answer.",
        "Reading “arc length” as “area” because the sector question format looks identical.",
      ],
      recap: [
        "Arc length = (θ/360) × 2πr.",
        "Same fraction as for area; different whole.",
        "Distances use r, areas use r².",
        "The arc can never be longer than the full circumference.",
      ],
      practice: [
        { q: "Arc length of a 180° sector of a circle with radius 7", a: "7pi" },
        { q: "Arc length of a 90° sector of a circle with radius 8", a: "4pi" },
        { q: "Arc length of a 60° sector of a circle with radius 12", a: "4pi" },
        { q: "Arc length of a 45° sector of a circle with radius 8", a: "2pi" },
        { q: "Arc length of a 270° sector of a circle with radius 4", a: "6pi" },
      ],
    },
    {
      title: "Finding the angle",
      intro: "The question is turned around: you are told the radius and the sector's area, and asked for the angle at the centre. It is the level 1 method run backwards.",
      sections: [
        {
          heading: "Compare the slice to the whole",
          paras: [
            "Work out the whole circle's area from the radius, then see what fraction of it the sector is. That fraction is θ/360.",
            "A sector of radius 6 with area 9π: the whole circle is 36π, so the sector is 9/36 = 1/4 of it.",
          ],
        },
        {
          heading: "Turn the fraction into degrees",
          paras: [
            "Multiply the fraction by 360. A quarter of 360 is 90, so the angle is 90°.",
            "The π cancels the moment you form the fraction — 9π over 36π is just 9/36 — so no π ever appears in your answer. The answer is a number of degrees.",
          ],
          example: { q: "A sector of a circle with radius 6 has area 9π. What is its central angle?", steps: ["Whole circle: π × 6² = 36π.", "The sector is 9π/36π = 1/4 of it.", "A quarter of 360°."], a: "90" },
        },
        {
          heading: "A second worked case",
          paras: [
            "The arithmetic is the same whatever the numbers. Whole circle, fraction, times 360.",
          ],
          example: { q: "A sector of a circle with radius 9 has area 27π. What is its central angle?", steps: ["Whole circle: π × 9² = 81π.", "The sector is 27/81 = 1/3 of it.", "A third of 360°."], a: "120" },
        },
        {
          heading: "Checking",
          paras: [
            "Run the forward calculation on your answer. If you said 120° for a radius-9 sector, then (120/360) × 81π = 27π, which is what the question said.",
            "It also pays to sanity-check the size: a sector area more than half the circle must give an angle above 180°, and one that is a small sliver must give a small angle.",
          ],
        },
      ],
      mistakes: [
        "Forgetting to multiply the fraction by 360 and giving 1/4 as the answer.",
        "Dividing the areas the wrong way round, so the fraction comes out greater than 1.",
        "Leaving π in the answer — it cancels, and the answer is in degrees.",
      ],
      recap: [
        "Find the whole circle's area, then the sector's fraction of it.",
        "That fraction times 360 is the angle.",
        "π cancels out of the fraction entirely.",
        "Check by running the forward calculation.",
      ],
      practice: [
        { q: "A sector of a circle with radius 4 has area 4π. What is its central angle?", a: "90" },
        { q: "A sector of a circle with radius 6 has area 18π. What is its central angle?", a: "180" },
        { q: "A sector of a circle with radius 6 has area 6π. What is its central angle?", a: "60" },
        { q: "A sector of a circle with radius 2 has area 3π. What is its central angle?", a: "270" },
        { q: "A sector of a circle with radius 4 has area 2π. What is its central angle?", a: "45" },
      ],
    },
  ],

  // ---- Crystal · Functions -------------------------------------------------
  functions: [
    {
      title: "Evaluating a linear function",
      intro: "You are given a rule like f(x) = 3x − 5 and a number to feed it, and asked what comes out. Once you read the notation correctly there is nothing here but substitution and arithmetic.",
      sections: [
        {
          heading: "What f(x) means",
          paras: [
            "f(x) = 3x − 5 defines a machine: whatever goes in gets tripled and then has 5 taken off. The x is a placeholder for whatever you put in.",
            "f(4) does not mean f times 4. It means run the rule with 4 in place of x. That misreading is the most expensive mistake in the whole topic, because it produces a plausible-looking number.",
          ],
        },
        {
          heading: "Substitute, then evaluate",
          paras: [
            "Replace every x with the input, keeping brackets round it, then work the arithmetic out in the usual order.",
            "f(4) for f(x) = 3x − 5 becomes 3(4) − 5 = 12 − 5 = 7.",
          ],
          example: { q: "f(x) = 3x − 5. Find f(4).", steps: ["Replace x with 4: 3(4) − 5.", "Multiply first: 12 − 5."], a: "7" },
        },
        {
          heading: "Negative inputs",
          paras: [
            "Brackets earn their keep when the input is negative. f(−3) for f(x) = −2x + 7 is −2(−3) + 7, and the two minus signs make a plus: 6 + 7 = 13.",
            "Writing −2 × −3 without brackets is where signs get lost. Put the input in brackets every time and the arithmetic looks after itself.",
          ],
          example: { q: "f(x) = −2x + 7. Find f(−3).", steps: ["Replace x with (−3): −2(−3) + 7.", "A negative times a negative is positive: 6 + 7."], a: "13" },
        },
        {
          heading: "Reading the name",
          paras: [
            "The letter f is only a name. Questions may use g or h instead, and the meaning is identical.",
            "That matters at level 3, where two differently named functions appear in the same question and you have to keep straight which rule is which.",
          ],
        },
      ],
      mistakes: [
        "Reading f(4) as multiplication by 4.",
        "Dropping a sign when the input is negative.",
        "Substituting into only the first x when the rule has more than one.",
      ],
      recap: [
        "f(x) = ... is a rule; f(4) means run it with 4.",
        "Replace every x, in brackets, then evaluate.",
        "Brackets protect you from sign errors on negative inputs.",
        "The function's name carries no meaning.",
      ],
      practice: [
        { q: "f(x) = 4x + 1. Find f(5).", a: "21" },
        { q: "f(x) = 2x − 9. Find f(6).", a: "3" },
        { q: "f(x) = −3x + 4. Find f(2).", a: "−2" },
        { q: "f(x) = 5x + 8. Find f(−3).", a: "−7" },
        { q: "f(x) = −x − 6. Find f(−4).", a: "−2" },
      ],
    },
    {
      title: "Evaluating a quadratic function",
      intro: "The rule now has an x² term — f(x) = 2x² − 3x + 1. Same substitution, but the squaring makes negative inputs genuinely treacherous.",
      sections: [
        {
          heading: "Substitute into every term",
          paras: [
            "Replace x wherever it appears, including inside the square. f(3) for f(x) = 2x² − 3x + 1 becomes 2(3)² − 3(3) + 1.",
            "Then follow the order of operations: the square first, then the multiplications, then the additions.",
          ],
        },
        {
          heading: "Squaring a negative input",
          paras: [
            "(−2)² is 4, not −4. The whole of −2 gets squared, and a negative times a negative is positive.",
            "Written without brackets as −2², the expression means −(2²) = −4, which is a different number. The brackets are not optional here — they are the difference between right and wrong.",
          ],
          example: { q: "f(x) = 2x² − 3x + 1. Find f(−2).", steps: ["Substitute: 2(−2)² − 3(−2) + 1.", "Square first: (−2)² = 4, so 2 × 4 = 8.", "Next term: −3 × (−2) = +6.", "Add: 8 + 6 + 1."], a: "15" },
        },
        {
          heading: "Two sign flips in one line",
          paras: [
            "A quadratic with a negative leading coefficient and a negative input has two places to slip. Take them one term at a time and write each down before combining.",
            "For f(x) = −x² + 5x − 4 at x = 3: −9, then +15, then −4, giving 2.",
          ],
          example: { q: "f(x) = −x² + 5x − 4. Find f(3).", steps: ["Substitute: −(3)² + 5(3) − 4.", "Square: 3² = 9, and the minus in front makes it −9.", "Then +15 and −4.", "−9 + 15 − 4."], a: "2" },
        },
        {
          heading: "Work term by term",
          paras: [
            "Write the value of each term on its own before adding anything. Three small numbers with their signs, then one addition at the end.",
            "It is slower to describe than to do, and it removes almost every error at this level.",
          ],
        },
      ],
      mistakes: [
        "Squaring without brackets, so (−2)² becomes −4.",
        "Doing the multiplication before the squaring.",
        "Combining terms as you go and losing a sign in the middle.",
      ],
      recap: [
        "Substitute into every term, brackets included.",
        "Square before you multiply.",
        "(−n)² is positive; −n² is negative. They are different.",
        "Evaluate each term separately, then add once.",
      ],
      practice: [
        { q: "f(x) = x² + 2x − 3. Find f(4).", a: "21" },
        { q: "f(x) = 3x² − x + 2. Find f(−1).", a: "6" },
        { q: "f(x) = −2x² + 4x + 5. Find f(2).", a: "5" },
        { q: "f(x) = x² − 6x + 9. Find f(5).", a: "4" },
        { q: "f(x) = 4x² + x − 7. Find f(−2).", a: "7" },
      ],
    },
    {
      title: "Composing functions",
      intro: "Two rules at once: f(g(2)) means run g first, then feed its answer into f. The only real difficulty is doing them in the right order.",
      sections: [
        {
          heading: "Inside out",
          paras: [
            "In f(g(2)) the g is closest to the 2, so g goes first. Whatever g produces becomes the input to f.",
            "It works exactly like brackets in arithmetic: innermost first. There is nothing new about the order, only about the notation.",
          ],
          example: { q: "f(x) = 3x + 1, g(x) = x² + 2. Find f(g(2)).", steps: ["Inside first: g(2) = 2² + 2 = 6.", "Now feed 6 into f: f(6) = 3(6) + 1."], a: "19" },
        },
        {
          heading: "Order changes the answer",
          paras: [
            "g(f(2)) with the same two rules gives something else entirely: f(2) = 7, and then g(7) = 49 + 2 = 51.",
            "So f(g(2)) is 19 and g(f(2)) is 51. Composition is not symmetric, and reading which is on the outside is half the question.",
          ],
          example: { q: "f(x) = 3x + 1, g(x) = x² + 2. Find g(f(2)).", steps: ["Inside first: f(2) = 3(2) + 1 = 7.", "Now feed 7 into g: g(7) = 7² + 2 = 49 + 2."], a: "51" },
        },
        {
          heading: "Write the middle number down",
          paras: [
            "Always record the result of the inner function on its own line before using it. It costs a second and makes the second step a simple substitution.",
            "Trying to hold the inner value in your head while evaluating the outer rule is where most errors at this level come from.",
          ],
        },
        {
          heading: "Reading which is outside",
          paras: [
            "Find the outermost letter — the one furthest from the number — and that is the rule applied last.",
            "In f(g(x)) it is f; in g(f(x)) it is g. Underlining the outer letter before you start is a small habit that prevents the commonest mistake.",
          ],
        },
      ],
      mistakes: [
        "Applying the outer function first.",
        "Substituting the input into both rules separately and combining the answers.",
        "Losing the inner result partway through and reusing the original input by accident.",
      ],
      recap: [
        "f(g(x)) means g first, then f.",
        "Work from the inside out, like brackets.",
        "f(g(2)) and g(f(2)) are usually different numbers.",
        "Write the inner answer down before continuing.",
      ],
      practice: [
        { q: "f(x) = 2x + 3, g(x) = x² − 1. Find f(g(3)).", a: "19" },
        { q: "f(x) = 2x + 3, g(x) = x² − 1. Find g(f(3)).", a: "80" },
        { q: "f(x) = x + 5, g(x) = x² + 4. Find f(g(−2)).", a: "13" },
        { q: "f(x) = −x + 2, g(x) = x². Find g(f(5)).", a: "9" },
        { q: "f(x) = 4x − 1, g(x) = x² + 3. Find f(g(1)).", a: "15" },
      ],
    },
  ],

  // ---- Crystal · Graphing Equations ----------------------------------------
  graphing: [
    {
      title: "Slope between two points",
      intro: "Two points are given and you want the slope of the line through them. The answer may be a fraction, and it may be negative.",
      sections: [
        {
          heading: "Slope is rise over run",
          paras: [
            "Slope measures steepness: how far the line climbs for each step across. Going from one point to the other, the rise is the change in y and the run is the change in x.",
            "So slope m = (y₂ − y₁)/(x₂ − x₁). The vertical change goes on top.",
          ],
        },
        {
          heading: "Subtract in the same order",
          paras: [
            "Whichever point you call first, be consistent: if you take y₂ − y₁ on top, you must take x₂ − x₁ on the bottom, in the same order.",
            "Reversing one but not the other flips the sign and gives a slope of the wrong direction — a common and easily avoided error.",
          ],
          example: { q: "Slope of the line through (−2, 5) and (4, −7)", steps: ["Rise: −7 − 5 = −12.", "Run: 4 − (−2) = 6.", "m = −12/6."], a: "−2" },
        },
        {
          heading: "What the sign and size mean",
          paras: [
            "A positive slope climbs left to right; a negative one falls. A slope of 2 rises two for every one across; a slope of 2/3 rises two for every three across, so it is gentler.",
            "That gives you a free check: sketch the two points roughly and see whether the line should be going up or down.",
          ],
        },
        {
          heading: "Fractional answers",
          paras: [
            "The run does not always divide the rise. From (1, 2) to (4, 4) the rise is 2 and the run is 3, so the slope is 2/3 — a perfectly good answer, left as a fraction.",
            "Reduce it as you would any fraction, and keep any minus sign at the front.",
          ],
          example: { q: "Slope of the line through (5, 1) and (2, 7)", steps: ["Rise: 7 − 1 = 6.", "Run: 2 − 5 = −3.", "m = 6/(−3)."], a: "−2" },
        },
      ],
      mistakes: [
        "Putting the run on top — slope is rise over run, not the other way round.",
        "Subtracting the y values one way and the x values the other, which flips the sign.",
        "Turning a fractional slope into a decimal when a fraction was asked for.",
      ],
      recap: [
        "m = (y₂ − y₁)/(x₂ − x₁): rise over run.",
        "Subtract both coordinates in the same order.",
        "Positive climbs, negative falls.",
        "Leave fractional slopes as reduced fractions.",
      ],
      practice: [
        { q: "Slope of the line through (0, 0) and (4, 8)", a: "2" },
        { q: "Slope of the line through (2, 3) and (6, 11)", a: "2" },
        { q: "Slope of the line through (−1, 4) and (3, −4)", a: "−2" },
        { q: "Slope of the line through (1, 2) and (4, 4)", a: "2/3" },
        { q: "Slope of the line through (5, 1) and (2, 7)", a: "−2" },
      ],
    },
    {
      title: "Finding the y-intercept",
      intro: "Two points on a line are given, and you want to know where the line crosses the y-axis. Find the slope first, then work back to the crossing point.",
      sections: [
        {
          heading: "Slope-intercept form",
          paras: [
            "Every straight line can be written y = mx + b, where m is the slope and b is the y value where the line crosses the y-axis.",
            "So the question is really: what is b? And you can get it as soon as you know m and one point on the line.",
          ],
        },
        {
          heading: "Slope first",
          paras: [
            "The intercept cannot be found without the slope, so start there: rise over run, exactly as at level 1.",
            "For the line through (2, 11) and (5, 23), the rise is 12 and the run is 3, so m = 4.",
          ],
        },
        {
          heading: "Then work back to x = 0",
          paras: [
            "Substitute the slope and either point into y = mx + b and solve for b. With (2, 11) and m = 4: 11 = 4(2) + b, so 11 = 8 + b and b = 3.",
            "Either point works and both must give the same answer — which makes using the second point a free check.",
          ],
          example: { q: "A line passes through (2, 11) and (5, 23). What is its y-intercept?", steps: ["Slope: (23 − 11)/(5 − 2) = 12/3 = 4.", "Put (2, 11) into y = 4x + b: 11 = 8 + b.", "So b = 3. Check with (5, 23): 4(5) + 3 = 23."], a: "3" },
        },
        {
          heading: "Negative slopes and negative points",
          paras: [
            "Nothing changes when the numbers turn negative; the signs simply need care. For (−1, 9) and (3, −7): the slope is −16/4 = −4, and 9 = −4(−1) + b gives 9 = 4 + b, so b = 5.",
            "Check with the other point: −4(3) + 5 = −7. It matches.",
          ],
          example: { q: "A line passes through (−1, 9) and (3, −7). What is its y-intercept?", steps: ["Slope: (−7 − 9)/(3 − (−1)) = −16/4 = −4.", "Put (−1, 9) in: 9 = −4(−1) + b = 4 + b.", "So b = 5."], a: "5" },
        },
      ],
      mistakes: [
        "Giving the slope as the answer instead of the intercept.",
        "Forgetting that b is what is left when x is 0, and reading off a y value from one of the given points.",
        "Sign slips when substituting a negative x into mx.",
      ],
      recap: [
        "y = mx + b, and b is the y-intercept.",
        "Work out the slope first.",
        "Substitute the slope and one point, then solve for b.",
        "Check with the other point — it must give the same b.",
      ],
      practice: [
        { q: "A line passes through (1, 7) and (4, 16). What is its y-intercept?", a: "4" },
        { q: "A line passes through (2, −1) and (5, 8). What is its y-intercept?", a: "−7" },
        { q: "A line passes through (0, 6) and (3, 0). What is its y-intercept?", a: "6" },
        { q: "A line passes through (−2, 10) and (2, 2). What is its y-intercept?", a: "6" },
        { q: "A line passes through (3, 5) and (6, 11). What is its y-intercept?", a: "−1" },
      ],
    },
    {
      title: "Intercepts from a standard-form equation",
      intro: "The line arrives written as ax + by = c — something like 3x + 4y = 12 — and you are asked where it crosses one of the axes. Two very short calculations, once you know which one to do.",
      sections: [
        {
          heading: "What an intercept is",
          paras: [
            "The x-axis is the line where y = 0, and the y-axis is where x = 0. A crossing point is simply where the line meets one of those.",
            "So finding an intercept means setting the other variable to zero. That single sentence is the whole level.",
          ],
        },
        {
          heading: "The x-intercept: set y = 0",
          paras: [
            "In 3x + 4y = 12, put y = 0. The 4y term disappears, leaving 3x = 12, so x = 4.",
            "The line crosses the x-axis at (4, 0), and the question wants the 4.",
          ],
          example: { q: "Where does 3x + 4y = 12 cross the x-axis? (give x)", steps: ["Crossing the x-axis means y = 0.", "3x + 4(0) = 12, so 3x = 12.", "Divide by 3."], a: "4" },
        },
        {
          heading: "The y-intercept: set x = 0",
          paras: [
            "The mirror image. In 2x − 5y = 20, put x = 0 to get −5y = 20, so y = −4.",
            "Watch the sign: dividing 20 by −5 gives a negative answer, and this is where most of the errors at this level live.",
          ],
          example: { q: "What is the y-intercept of 2x − 5y = 20? (give y)", steps: ["Crossing the y-axis means x = 0.", "2(0) − 5y = 20, so −5y = 20.", "Divide by −5."], a: "−4" },
        },
        {
          heading: "Which one am I being asked for?",
          paras: [
            "The phrasing varies: “cross the x-axis” and “x-intercept” mean the same thing, and both want you to set y to zero.",
            "The trap is that you zero the variable you are not being asked about. Asked for x, set y = 0. Say it to yourself before you start.",
          ],
        },
      ],
      mistakes: [
        "Zeroing the wrong variable — setting x = 0 when the question asked for the x-intercept.",
        "Losing the minus when dividing by a negative coefficient.",
        "Giving the whole coordinate pair when the question asked for a single number.",
      ],
      recap: [
        "The x-axis is y = 0; the y-axis is x = 0.",
        "For the x-intercept set y = 0 and solve for x; for the y-intercept set x = 0.",
        "Zero the variable you are not being asked for.",
        "Mind the sign when the coefficient is negative.",
      ],
      practice: [
        { q: "Where does 2x + 3y = 12 cross the x-axis? (give x)", a: "6" },
        { q: "What is the y-intercept of 4x + 5y = 20? (give y)", a: "4" },
        { q: "Where does 5x − 2y = 15 cross the x-axis? (give x)", a: "3" },
        { q: "What is the y-intercept of 3x − 7y = 21? (give y)", a: "−3" },
        { q: "Where does x + 6y = 9 cross the x-axis? (give x)", a: "9" },
      ],
    },
  ],

  // ---- Crystal · Factoring Polynomials -------------------------------------
  factoring: [
    {
      title: "Factoring with positive signs",
      intro: "Turning x² + 7x + 12 back into (x + 3)(x + 4). Everything is positive at this level, which lets you concentrate on the search itself before the signs get involved.",
      sections: [
        {
          heading: "Factoring runs multiplication backwards",
          paras: [
            "Multiplying (x + 3)(x + 4) gives x² + 7x + 12: the 7 is 3 + 4 and the 12 is 3 × 4. Factoring is finding those two numbers again from the answer.",
            "So every factoring question is the same search: two numbers that multiply to the constant and add to the middle coefficient.",
          ],
        },
        {
          heading: "The search",
          paras: [
            "List the factor pairs of the constant, then check which pair adds to the middle number. For 12: 1 and 12, 2 and 6, 3 and 4. Only 3 and 4 add to 7.",
            "Start from the product, not the sum. The constant has only a handful of factor pairs, while endless pairs add to 7.",
          ],
          example: { q: "Factor x² + 7x + 12", steps: ["Pairs multiplying to 12: 1×12, 2×6, 3×4.", "Which pair adds to 7? 3 and 4.", "So the brackets are (x+3)(x+4)."], a: "(x+3)(x+4)" },
        },
        {
          heading: "Order does not matter",
          paras: [
            "(x + 3)(x + 4) and (x + 4)(x + 3) are the same thing, and both are accepted.",
            "So there is no need to worry about which number goes in which bracket at this level.",
          ],
          example: { q: "Factor x² + 11x + 18", steps: ["Pairs multiplying to 18: 1×18, 2×9, 3×6.", "Which adds to 11? 2 and 9.", "So (x+2)(x+9)."], a: "(x+2)(x+9)" },
        },
        {
          heading: "Check by expanding",
          paras: [
            "Multiply your brackets back out. The x² and the constant are usually right by construction, so the middle term is what the check is really for.",
            "(x + 2)(x + 9) gives 9x + 2x = 11x. That matches, so the factoring is correct.",
          ],
        },
      ],
      mistakes: [
        "Finding a pair that adds correctly but multiplies wrongly — check both conditions.",
        "Searching the sums first, which is a much larger space than the products.",
        "Writing the numbers with the x, as (3x)(4x), rather than as x plus each number.",
      ],
      recap: [
        "Find two numbers that multiply to the constant and add to the middle coefficient.",
        "List the factor pairs of the constant and test their sums.",
        "The order of the two brackets does not matter.",
        "Expand to check, watching the middle term.",
      ],
      practice: [
        { q: "Factor x² + 5x + 6", a: "(x+2)(x+3)" },
        { q: "Factor x² + 8x + 15", a: "(x+3)(x+5)" },
        { q: "Factor x² + 10x + 21", a: "(x+3)(x+7)" },
        { q: "Factor x² + 9x + 20", a: "(x+4)(x+5)" },
        { q: "Factor x² + 13x + 36", a: "(x+4)(x+9)" },
      ],
    },
    {
      title: "Factoring with negative signs",
      intro: "The same search, but the two numbers may now be negative — x² − 2x − 15 factors as (x + 3)(x − 5). Reading the signs off the equation before you start turns this from guesswork into a short check.",
      sections: [
        {
          heading: "The constant's sign tells you the most",
          paras: [
            "If the constant is positive, the two numbers share a sign — both positive or both negative — because only matching signs multiply to a positive.",
            "If the constant is negative, they have opposite signs. That single observation halves the search before you begin.",
          ],
        },
        {
          heading: "Then the middle term decides",
          paras: [
            "When the two numbers share a sign, the middle coefficient tells you which: x² − 9x + 20 has a positive constant, so both are negative, and they add to −9. That gives −4 and −5.",
            "When they differ, the middle coefficient tells you which one is larger. In x² − 2x − 15 the numbers multiply to −15 and add to −2, so the negative one is bigger: 3 and −5.",
          ],
          example: { q: "Factor x² − 2x − 15", steps: ["The constant is negative, so the signs differ.", "Pairs multiplying to 15: 1×15, 3×5.", "3 and −5 add to −2.", "So (x+3)(x−5)."], a: "(x+3)(x−5)" },
        },
        {
          heading: "Both negative",
          paras: [
            "A positive constant with a negative middle term means both numbers are negative — the case people most often miss, because the positive constant makes them look for positives.",
            "x² − 9x + 20: both negative, multiplying to 20 and adding to −9, so −4 and −5.",
          ],
          example: { q: "Factor x² − 9x + 20", steps: ["Positive constant, so the signs match; negative middle, so both are negative.", "Pairs multiplying to 20: 1×20, 2×10, 4×5.", "−4 and −5 add to −9."], a: "(x−4)(x−5)" },
        },
        {
          heading: "Check the middle term",
          paras: [
            "Expanding is even more worthwhile here, because a sign error leaves the x² and constant untouched and only shows up in the middle.",
            "(x + 3)(x − 5) gives −5x + 3x = −2x. Correct. Had you written (x − 3)(x + 5) you would get +2x — same size, wrong sign.",
          ],
        },
      ],
      mistakes: [
        "Assuming a positive constant means two positive numbers.",
        "Getting the size right but the signs the wrong way round, which flips the middle term.",
        "Forgetting that the constant's sign already tells you whether the signs match.",
      ],
      recap: [
        "Positive constant: signs match. Negative constant: signs differ.",
        "The middle coefficient then decides which sign, or which number is larger.",
        "Still two numbers multiplying to the constant and adding to the middle.",
        "Expand and check the middle term's sign.",
      ],
      practice: [
        { q: "Factor x² − 5x + 6", a: "(x−2)(x−3)" },
        { q: "Factor x² + 2x − 8", a: "(x+4)(x−2)" },
        { q: "Factor x² − x − 12", a: "(x+3)(x−4)" },
        { q: "Factor x² − 7x + 12", a: "(x−3)(x−4)" },
        { q: "Factor x² + 3x − 10", a: "(x+5)(x−2)" },
      ],
    },
    {
      title: "Factoring with a leading coefficient",
      intro: "Now the x² term has a number in front — 3x² + 5x − 2. The brackets come out as (3x − 1)(x + 2), and the extra coefficient means the middle term is no longer a simple sum.",
      sections: [
        {
          heading: "Why the old shortcut breaks",
          paras: [
            "With x² alone, the middle coefficient was just p + q. With 3x² it is not: expanding (3x + p)(x + q) gives 3x² + (3q + p)x + pq.",
            "So the middle term is 3q + p, not p + q. The two numbers still multiply to the constant, but they no longer simply add to the middle.",
          ],
        },
        {
          heading: "The multiply-and-split method",
          paras: [
            "Multiply the leading coefficient by the constant: for 3x² + 5x − 2 that is 3 × (−2) = −6. Now find two numbers multiplying to −6 and adding to the middle coefficient, 5.",
            "That is 6 and −1. Those two numbers are the split of the middle term, and they lead straight to the brackets.",
          ],
          example: { q: "Factor 3x² + 5x − 2", steps: ["Multiply ends: 3 × (−2) = −6.", "Two numbers multiplying to −6 and adding to 5: 6 and −1.", "Split the middle: 3x² + 6x − x − 2.", "Group: 3x(x + 2) − 1(x + 2), so (3x − 1)(x + 2)."], a: "(3x−1)(x+2)" },
        },
        {
          heading: "Grouping the split",
          paras: [
            "Once the middle term is split, take a common factor out of each half. From 3x² + 6x you can take 3x, leaving (x + 2); from −x − 2 you can take −1, leaving (x + 2).",
            "Both halves must produce the same bracket. If they do not, the split was wrong — swap the two numbers round and try again.",
          ],
        },
        {
          heading: "Or test the possibilities",
          paras: [
            "With small coefficients, trial is often quicker. For 2x² + 7x + 3 the first terms must be 2x and x, and the constants must multiply to 3, so the only candidates are (2x + 1)(x + 3) and (2x + 3)(x + 1).",
            "Expand the middle of each: the first gives 6x + x = 7x, which is right. Two expansions and you are done.",
          ],
          example: { q: "Factor 2x² + 7x + 3", steps: ["First terms must be 2x and x; constants must multiply to 3.", "Try (2x + 1)(x + 3): middle is 6x + x = 7x. That matches."], a: "(2x+1)(x+3)" },
        },
      ],
      mistakes: [
        "Using p + q for the middle term and ignoring the leading coefficient.",
        "Putting the constants in the wrong brackets — (2x + 3)(x + 1) and (2x + 1)(x + 3) give different middle terms.",
        "Stopping after the split without grouping into brackets.",
      ],
      recap: [
        "Expanding (ax + p)(x + q) gives a middle term of aq + p, not p + q.",
        "Multiply the two ends, find numbers multiplying to that and adding to the middle.",
        "Split the middle term and group into brackets.",
        "With small numbers, testing the few possible bracket layouts is faster.",
      ],
      practice: [
        { q: "Factor 2x² + 7x + 3", a: "(2x+1)(x+3)" },
        { q: "Factor 3x² − 5x − 2", a: "(3x+1)(x−2)" },
        { q: "Factor 2x² − 5x + 3", a: "(2x−3)(x−1)" },
        { q: "Factor 4x² + 11x + 6", a: "(4x+3)(x+2)" },
        { q: "Factor 3x² + 10x + 3", a: "(3x+1)(x+3)" },
      ],
    },
  ],

  // ---- Emerald · Multiplying Polynomials -----------------------------------
  multiplyPoly: [
    {
      title: "Expanding two simple brackets",
      intro: "The reverse of factoring: turn (x − 4)(x + 9) into x² + 5x − 36. Answers are written in the compact form x^2+5x-36.",
      sections: [
        {
          heading: "Every term meets every term",
          paras: [
            "(x + p)(x + q) means multiplying out four pairs: x×x, x×q, p×x and p×q. Nothing in the first bracket is allowed to skip anything in the second.",
            "Collecting those gives x² + (p + q)x + pq — which is exactly the pattern factoring reverses.",
          ],
        },
        {
          heading: "The shortcut",
          paras: [
            "Because the pattern is fixed, you can write the answer straight down: square term, then the sum in the middle, then the product at the end.",
            "For (x − 4)(x + 9): the sum is −4 + 9 = 5 and the product is −4 × 9 = −36, giving x² + 5x − 36.",
          ],
          example: { q: "Expand (x − 4)(x + 9)", steps: ["First terms: x × x = x².", "Middle: −4 + 9 = 5, so 5x.", "Last: −4 × 9 = −36."], a: "x^2+5x-36" },
        },
        {
          heading: "Signs travel with their numbers",
          paras: [
            "Treat (x − 4) as x plus negative four. Then the sum and product rules work without any special cases.",
            "Two negatives make a positive constant: (x − 2)(x − 5) has product +10 and sum −7, giving x² − 7x + 10.",
          ],
          example: { q: "Expand (x − 2)(x − 5)", steps: ["Sum: −2 + −5 = −7.", "Product: −2 × −5 = +10."], a: "x^2-7x+10" },
        },
        {
          heading: "When the middle disappears",
          paras: [
            "(x + 4)(x − 4) has a sum of zero, so the x term vanishes entirely and the answer is x² − 16.",
            "This is the difference of two squares, and it is worth recognising: (x + n)(x − n) is always x² − n², with no middle term.",
          ],
        },
      ],
      mistakes: [
        "Multiplying only the first terms and the last terms, missing the two cross products.",
        "Losing a sign, so the middle term comes out with the wrong direction.",
        "Writing the answer with a middle term when the sum is zero.",
      ],
      recap: [
        "(x + p)(x + q) = x² + (p + q)x + pq.",
        "Four products in total; the middle is the sum of the two cross terms.",
        "Carry each sign with its number.",
        "(x + n)(x − n) = x² − n², with no middle term.",
      ],
      practice: [
        { q: "Expand (x + 1)(x + 6)", a: "x^2+7x+6" },
        { q: "Expand (x − 3)(x + 8)", a: "x^2+5x-24" },
        { q: "Expand (x − 2)(x − 5)", a: "x^2-7x+10" },
        { q: "Expand (x + 4)(x − 4)", a: "x^2-16" },
        { q: "Expand (x − 1)(x − 9)", a: "x^2-10x+9" },
      ],
    },
    {
      title: "Expanding with leading coefficients",
      intro: "Both brackets now carry a number in front of the x — (2x + 3)(4x − 5). The four products are still there, but the shortcut from level 1 no longer applies.",
      sections: [
        {
          heading: "Back to all four products",
          paras: [
            "(ax + b)(cx + d) gives acx², adx, bcx and bd. The two middle terms are ad and bc, and they are no longer a simple sum of b and d.",
            "So write all four out. The pattern is acx² + (ad + bc)x + bd.",
          ],
          example: { q: "Expand (2x + 3)(4x − 5)", steps: ["First terms: 2x × 4x = 8x².", "Outer: 2x × −5 = −10x.", "Inner: 3 × 4x = 12x.", "Last: 3 × −5 = −15. Middle: −10x + 12x = 2x."], a: "8x^2+2x-15" },
        },
        {
          heading: "A fixed order stops you losing one",
          paras: [
            "Always go first, outer, inner, last — the same route every time. Four products, four terms, then collect the middle two.",
            "Skipping around is how a term goes missing, and a missing cross term is invisible in the finished answer.",
          ],
          example: { q: "Expand (3x − 1)(2x + 5)", steps: ["First: 3x × 2x = 6x².", "Outer: 3x × 5 = 15x.", "Inner: −1 × 2x = −2x.", "Last: −1 × 5 = −5. Middle: 15x − 2x = 13x."], a: "6x^2+13x-5" },
        },
        {
          heading: "Only the middle terms combine",
          paras: [
            "The x² term and the constant each come from a single product, so they need no collecting. Only the outer and inner terms are like terms.",
            "That makes the middle the only place arithmetic can go wrong, and the only part worth double-checking.",
          ],
        },
        {
          heading: "Difference of squares again",
          paras: [
            "(3x − 4)(3x + 4) has outer 12x and inner −12x, which cancel. The answer is 9x² − 16.",
            "Whenever the two brackets are identical apart from the sign, expect the middle to vanish.",
          ],
        },
      ],
      mistakes: [
        "Using the level 1 shortcut and adding b and d for the middle term.",
        "Multiplying the coefficients but forgetting that x × x gives x².",
        "Collecting the outer and inner terms with a sign error.",
      ],
      recap: [
        "(ax + b)(cx + d) = acx² + (ad + bc)x + bd.",
        "Work first, outer, inner, last, in that order every time.",
        "Only the outer and inner terms combine.",
        "Identical brackets with opposite signs cancel the middle.",
      ],
      practice: [
        { q: "Expand (2x + 1)(3x + 4)", a: "6x^2+11x+4" },
        { q: "Expand (5x − 2)(x + 3)", a: "5x^2+13x-6" },
        { q: "Expand (4x + 3)(2x − 1)", a: "8x^2+2x-3" },
        { q: "Expand (3x − 4)(3x + 4)", a: "9x^2-16" },
        { q: "Expand (2x − 5)(4x − 3)", a: "8x^2-26x+15" },
      ],
    },
    {
      title: "Squaring a bracket",
      intro: "(3x + 5)² and its relatives. It is an ordinary expansion of a bracket by itself, but it has a pattern worth learning — and a trap that catches almost everybody once.",
      sections: [
        {
          heading: "It is not what it looks like",
          paras: [
            "(x + 5)² is not x² + 25. Squaring a sum is not the same as summing the squares, and the difference is a middle term that is easy to forget.",
            "Written out, (x + 5)² is (x + 5)(x + 5), which expands to x² + 5x + 5x + 25 = x² + 10x + 25. The 10x is real.",
          ],
        },
        {
          heading: "The pattern",
          paras: [
            "(ax + b)² = a²x² + 2abx + b². Square the first term, square the last term, and the middle is twice their product.",
            "For (3x + 5)²: 9x², then 2 × 3 × 5 = 30x, then 25.",
          ],
          example: { q: "Expand (3x + 5)²", steps: ["Square the first term: (3x)² = 9x².", "Middle: 2 × 3x × 5 = 30x.", "Square the last term: 5² = 25."], a: "9x^2+30x+25" },
        },
        {
          heading: "A negative inside",
          paras: [
            "(2x − 7)² follows the same pattern with b = −7. The middle becomes 2 × 2 × (−7) = −28, and the last term is (−7)² = +49.",
            "So the constant is always positive, and only the middle term carries the sign. That is a useful check on your answer.",
          ],
          example: { q: "Expand (2x − 7)²", steps: ["First: (2x)² = 4x².", "Middle: 2 × 2x × (−7) = −28x.", "Last: (−7)² = +49."], a: "4x^2-28x+49" },
        },
        {
          heading: "Why doubling",
          paras: [
            "The cross terms are ax × b and b × ax — the same product, appearing twice. That is where the 2 comes from.",
            "If you ever forget the pattern, just write the bracket out twice and expand normally. It is two extra seconds and it always works.",
          ],
        },
      ],
      mistakes: [
        "Squaring each term and dropping the middle: (x + 5)² given as x² + 25.",
        "Forgetting to square the coefficient — (3x)² is 9x², not 3x².",
        "Making the constant negative when the bracket had a minus in it.",
      ],
      recap: [
        "(ax + b)² = a²x² + 2abx + b².",
        "Square both ends, and double the cross product for the middle.",
        "The constant is always positive; the sign shows up in the middle term.",
        "When in doubt, write the bracket twice and expand it the long way.",
      ],
      practice: [
        { q: "Expand (x + 6)²", a: "x^2+12x+36" },
        { q: "Expand (2x + 3)²", a: "4x^2+12x+9" },
        { q: "Expand (5x − 1)²", a: "25x^2-10x+1" },
        { q: "Expand (4x + 5)²", a: "16x^2+40x+25" },
        { q: "Expand (3x − 2)²", a: "9x^2-12x+4" },
      ],
    },
  ],

  // ---- Emerald · Systems of Equations --------------------------------------
  systems: [
    {
      title: "Solving by substitution",
      intro: "Two equations, two unknowns, and one of them already tells you what y is — like y = 2x − 1 alongside 3x + 2y = 12. Answers are given as a coordinate pair.",
      sections: [
        {
          heading: "Two equations, one shared answer",
          paras: [
            "A pair of equations like this has one x and one y that satisfy both at once. Either equation alone has endless solutions; together they pin down exactly one pair.",
            "So the answer is always two numbers, written as (x, y).",
          ],
        },
        {
          heading: "Substitute the ready-made expression",
          paras: [
            "When one equation already reads y = something, you can replace y in the other equation with that whole expression. The second equation then has only x in it.",
            "3x + 2y = 12 with y = 2x − 1 becomes 3x + 2(2x − 1) = 12. Keep the brackets — the 2 multiplies the whole expression, not just the 2x.",
          ],
          example: { q: "y = 2x − 1;  3x + 2y = 12. Solve for (x, y).", steps: ["Substitute: 3x + 2(2x − 1) = 12.", "Expand: 3x + 4x − 2 = 12, so 7x = 14.", "x = 2. Then y = 2(2) − 1 = 3."], a: "(2, 3)" },
        },
        {
          heading: "Finish by finding the other variable",
          paras: [
            "Getting x is only half the job. Put it back into the simplest equation — usually the y = one — to get y.",
            "Answering with just x is the most common way to lose marks here, because the work was all correct.",
          ],
          example: { q: "y = −x + 4;  2x + 3y = 10. Solve for (x, y).", steps: ["Substitute: 2x + 3(−x + 4) = 10.", "Expand: 2x − 3x + 12 = 10, so −x = −2.", "x = 2. Then y = −2 + 4 = 2."], a: "(2, 2)" },
        },
        {
          heading: "Check in both equations",
          paras: [
            "A correct pair satisfies both equations, so substitute it into each. For (2, 3): y = 2(2) − 1 = 3 holds, and 3(2) + 2(3) = 12 holds.",
            "Checking only the equation you substituted into will not catch an arithmetic slip, because that equation is where the slip happened.",
          ],
        },
      ],
      mistakes: [
        "Dropping the brackets when substituting, so the coefficient hits only the first term.",
        "Stopping once x is found and never computing y.",
        "Substituting back into the equation you already used, instead of checking both.",
      ],
      recap: [
        "The answer is one pair (x, y) that satisfies both equations.",
        "Replace y in the second equation with the whole expression, in brackets.",
        "Solve for x, then substitute back for y.",
        "Check the pair in both original equations.",
      ],
      practice: [
        { q: "y = 3x − 2;  x + 2y = 10. Solve for (x, y).", a: "(2, 4)" },
        { q: "y = x + 5;  2x − y = 1. Solve for (x, y).", a: "(6, 11)" },
        { q: "y = −2x + 7;  3x + y = 8. Solve for (x, y).", a: "(1, 5)" },
        { q: "y = 4x;  x + y = 10. Solve for (x, y).", a: "(2, 8)" },
        { q: "y = 2x + 1;  5x − 2y = 4. Solve for (x, y).", a: "(6, 13)" },
      ],
    },
    {
      title: "Solving by elimination",
      intro: "Both equations are now in the form ax + by = c, so neither hands you a variable ready to substitute. Instead you add or subtract the equations to make one variable disappear.",
      sections: [
        {
          heading: "Add the equations and watch a variable go",
          paras: [
            "In 2x + 3y = 12 and 4x − 3y = 6, the y terms are +3y and −3y. Adding the two equations term by term cancels them completely, leaving 6x = 18.",
            "You are allowed to add two equations because both sides of each are equal — adding equals to equals keeps the balance.",
          ],
          example: { q: "2x + 3y = 12;  4x − 3y = 6. Solve for (x, y).", steps: ["The y terms are +3y and −3y, so add the equations: 6x = 18.", "x = 3.", "Substitute into the first: 6 + 3y = 12, so y = 2."], a: "(3, 2)" },
        },
        {
          heading: "Subtract when the signs match",
          paras: [
            "If a variable appears with the same sign in both — say +y and +y — subtracting removes it instead.",
            "For 4x + y = 14 and 2x + y = 8, subtracting gives 2x = 6, so x = 3, and then y = 2.",
          ],
          example: { q: "4x + y = 14;  2x + y = 8. Solve for (x, y).", steps: ["Both have +y, so subtract the second from the first: 2x = 6.", "x = 3.", "Substitute: 4(3) + y = 14, so y = 2."], a: "(3, 2)" },
        },
        {
          heading: "Which variable to eliminate",
          paras: [
            "Look for the variable whose coefficients already match in size — those cancel with no preparation at all.",
            "In 2x + 5y = 19 and 2x − y = 1, the x terms match, so subtracting eliminates x and leaves 6y = 18.",
          ],
        },
        {
          heading: "Then finish and check",
          paras: [
            "Once one variable is known, substitute it into whichever original equation looks simpler to get the other.",
            "Check the pair in both equations, as always. Elimination has more places to slip a sign than substitution does.",
          ],
        },
      ],
      mistakes: [
        "Adding when you should subtract, so the variable doubles instead of cancelling.",
        "Adding the left sides but forgetting to add the right sides too.",
        "Cancelling a variable and then solving for the one that is gone.",
      ],
      recap: [
        "Add the equations when a variable has opposite signs; subtract when the signs match.",
        "Aim at the variable whose coefficients already match in size.",
        "Substitute back for the second variable.",
        "Check the pair in both equations.",
      ],
      practice: [
        { q: "x + y = 7;  x − y = 1. Solve for (x, y).", a: "(4, 3)" },
        { q: "2x + y = 12;  x − y = 3. Solve for (x, y).", a: "(5, 2)" },
        { q: "2x + 5y = 19;  2x − y = 1. Solve for (x, y).", a: "(2, 3)" },
        { q: "4x + y = 14;  2x + y = 8. Solve for (x, y).", a: "(3, 2)" },
        { q: "x + 2y = 11;  3x − 2y = 9. Solve for (x, y).", a: "(5, 3)" },
      ],
    },
    {
      title: "Elimination with scaling",
      intro: "The coefficients no longer line up — 3x + 4y = 26 and 5x − 2y = 26 have nothing that cancels on its own. Multiply one or both equations first, then eliminate as before.",
      sections: [
        {
          heading: "Multiply a whole equation",
          paras: [
            "An equation can be multiplied through by any number without changing its solutions, as long as every term on both sides is multiplied.",
            "Doubling 5x − 2y = 26 gives 10x − 4y = 52. It says the same thing, but now its y term is −4y, ready to cancel a +4y.",
          ],
          example: { q: "3x + 4y = 26;  5x − 2y = 26. Solve for (x, y).", steps: ["Double the second equation: 10x − 4y = 52.", "Now +4y and −4y cancel when added: 13x = 78, so x = 6.", "Substitute: 18 + 4y = 26, so y = 2."], a: "(6, 2)" },
        },
        {
          heading: "Choosing the multiplier",
          paras: [
            "Look at the two coefficients of the variable you want gone and find their least common multiple. For 2 and 3, that is 6, so multiply one equation by 3 and the other by 2.",
            "Often only one equation needs scaling, as above. Check for that first — it is half the work.",
          ],
          example: { q: "2x + 3y = 7;  5x + 2y = 12. Solve for (x, y).", steps: ["To clear y, use 6: multiply the first by 2 and the second by 3.", "4x + 6y = 14 and 15x + 6y = 36.", "Subtract: 11x = 22, so x = 2.", "Substitute: 4 + 3y = 7, so y = 1."], a: "(2, 1)" },
        },
        {
          heading: "Multiply every single term",
          paras: [
            "This is where the level goes wrong. Doubling 5x − 2y = 26 must give 10x − 4y = 52 — the right-hand side is doubled too.",
            "Leaving the constant untouched produces a clean-looking but completely wrong answer, and nothing later in the working reveals it.",
          ],
        },
        {
          heading: "Checking matters more here",
          paras: [
            "With scaling, substituting, and a sign to track, there are more steps than at either level below. Always put the final pair back into both original equations — not the scaled versions.",
            "Checking against the scaled equations would confirm the scaling rather than test it.",
          ],
        },
      ],
      mistakes: [
        "Multiplying the left side of an equation but not the right.",
        "Scaling one equation and forgetting the other when both needed it.",
        "Checking the answer against the scaled equations instead of the originals.",
      ],
      recap: [
        "Multiplying a whole equation through changes nothing about its solutions.",
        "Scale so that one variable's coefficients match in size.",
        "Use the least common multiple; often only one equation needs it.",
        "Every term, both sides. Then check in the original equations.",
      ],
      practice: [
        { q: "3x + 2y = 16;  2x + 5y = 18. Solve for (x, y).", a: "(4, 2)" },
        { q: "4x + 3y = 18;  2x − y = 4. Solve for (x, y).", a: "(3, 2)" },
        { q: "2x + 7y = 29;  5x − 3y = 11. Solve for (x, y).", a: "(4, 3)" },
        { q: "3x + 8y = 23;  4x − 5y = 15. Solve for (x, y).", a: "(5, 1)" },
        { q: "4x + 3y = 23;  5x − 2y = 0. Solve for (x, y).", a: "(2, 5)" },
      ],
    },
  ],

  // ---- Emerald · Solving Quadratics ----------------------------------------
  quadratics: [
    {
      title: "Square roots and the positive solution",
      intro: "The simplest quadratics there are: x² = 144, or x² − 81 = 0. Both have two solutions, and the question asks for the positive one.",
      sections: [
        {
          heading: "Every square has two roots",
          paras: [
            "If x² = 144, then x could be 12 or −12, because both give 144 when squared. A quadratic equation normally has two solutions and this is the simplest reason why.",
            "The question asks for the positive solution, so you give 12 — but it is worth knowing the other one is there.",
          ],
          example: { q: "x² = 144. Positive solution?", steps: ["What squares to 144? 12, and also −12.", "The question asks for the positive one."], a: "12" },
        },
        {
          heading: "Rearranging first",
          paras: [
            "x² − 81 = 0 is the same question in disguise. Add 81 to both sides to get x² = 81, and then take the root.",
            "Whenever a quadratic has no x term, isolating the x² and rooting it is the whole method.",
          ],
          example: { q: "x² − 81 = 0. Positive solution?", steps: ["Add 81 to both sides: x² = 81.", "What squares to 81? 9."], a: "9" },
        },
        {
          heading: "Knowing your squares",
          paras: [
            "This level is really a test of the squares you learned in Silver: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225.",
            "Reading that list backwards answers every question here instantly.",
          ],
        },
        {
          heading: "Checking",
          paras: [
            "Square your answer and see whether you land back on the number in the question. 13² = 169, so 13 is right for x² = 169.",
            "It takes one multiplication, and it catches the occasional slip between neighbouring squares.",
          ],
        },
      ],
      mistakes: [
        "Halving instead of square-rooting: x² = 144 answered as 72.",
        "Forgetting to rearrange, and rooting the constant while it is still on the left.",
        "Giving the negative solution when the positive one was asked for.",
      ],
      recap: [
        "x² = n has two solutions, +√n and −√n.",
        "Isolate the x² first, then take the root.",
        "The squares to 15 cover everything at this level.",
        "Square your answer to check.",
      ],
      practice: [
        { q: "x² = 49. Positive solution?", a: "7" },
        { q: "x² = 169. Positive solution?", a: "13" },
        { q: "x² − 100 = 0. Positive solution?", a: "10" },
        { q: "x² = 225. Positive solution?", a: "15" },
        { q: "x² − 36 = 0. Positive solution?", a: "6" },
      ],
    },
    {
      title: "Solving by factoring",
      intro: "Equations like x² − 7x + 10 = 0, where both solutions are wanted, comma-separated. Factor the left side and the answers fall out.",
      sections: [
        {
          heading: "The zero product rule",
          paras: [
            "If two things multiply to give zero, at least one of them must be zero. Nothing else can produce zero from a product.",
            "So once x² − 7x + 10 = 0 is written as (x − 2)(x − 5) = 0, either x − 2 = 0 or x − 5 = 0. That gives x = 2 or x = 5.",
          ],
          example: { q: "Solve x² − 7x + 10 = 0", steps: ["Factor: two numbers multiplying to 10 and adding to −7 are −2 and −5.", "So (x − 2)(x − 5) = 0.", "Each bracket can be zero: x = 2 or x = 5."], a: "2, 5" },
        },
        {
          heading: "The roots are the opposites of the numbers",
          paras: [
            "This is where signs get lost. The bracket (x + 3) is zero when x = −3, not +3 — you set the bracket to zero and solve, which flips the sign.",
            "So x² + 5x + 6 = (x + 2)(x + 3) has roots −2 and −3. The factored form and the solutions carry opposite signs.",
          ],
          example: { q: "Solve x² + 5x + 6 = 0", steps: ["Factor: −2 and −3 multiply to 6 and add to 5, so the brackets are (x + 2)(x + 3).", "x + 2 = 0 gives x = −2.", "x + 3 = 0 gives x = −3."], a: "−2, −3" },
        },
        {
          heading: "It must equal zero first",
          paras: [
            "The zero product rule only works against zero. If the equation reads x² − 7x = −10, move everything to one side before factoring.",
            "Factoring against any other number tells you nothing: two things multiplying to 10 could be a thousand different pairs.",
          ],
        },
        {
          heading: "Giving both answers",
          paras: [
            "Two brackets mean two solutions, and the question wants both, separated by a comma. The order does not matter.",
            "Check each one separately by substituting it into the original equation — each should give zero.",
          ],
          example: { q: "Solve x² − x − 12 = 0", steps: ["Factor: 3 and −4 multiply to −12 and add to −1, so (x + 3)(x − 4) = 0.", "x = −3 or x = 4.", "Check: 16 − 4 − 12 = 0."], a: "4, −3" },
        },
      ],
      mistakes: [
        "Giving the numbers inside the brackets as the answers, with the signs unflipped.",
        "Factoring while the equation still equals something other than zero.",
        "Giving only one of the two solutions.",
      ],
      recap: [
        "Get the equation equal to zero, then factor.",
        "If a product is zero, one of the factors is zero.",
        "(x + p) = 0 gives x = −p — the sign flips.",
        "Give both solutions, and substitute each one back.",
      ],
      practice: [
        { q: "Solve x² − 9x + 20 = 0", a: "4, 5" },
        { q: "Solve x² + 5x + 6 = 0", a: "−2, −3" },
        { q: "Solve x² − x − 12 = 0", a: "4, −3" },
        { q: "Solve x² + 7x + 12 = 0", a: "−3, −4" },
        { q: "Solve x² − 2x − 15 = 0", a: "5, −3" },
      ],
    },
    {
      title: "Quadratics with a leading coefficient",
      intro: "Equations like 3x² + 5x − 2 = 0. The x² term has a number in front, which means one of the two solutions is usually a fraction.",
      sections: [
        {
          heading: "Factor as you learned in Crystal",
          paras: [
            "The factoring is exactly the Crystal level 3 method: multiply the ends, find two numbers, split the middle and group — or test the few possible bracket layouts.",
            "3x² + 5x − 2 factors as (3x − 1)(x + 2). From there the zero product rule takes over as usual.",
          ],
        },
        {
          heading: "A bracket with a coefficient gives a fraction",
          paras: [
            "Setting 3x − 1 = 0 gives 3x = 1, so x = 1/3. The coefficient in front of the x becomes the denominator of the solution.",
            "That is the whole reason this level exists: (ax + b) = 0 gives x = −b/a, and unless a divides b, that is a fraction.",
          ],
          example: { q: "Solve 3x² + 5x − 2 = 0", steps: ["Factor: (3x − 1)(x + 2) = 0.", "3x − 1 = 0 gives 3x = 1, so x = 1/3.", "x + 2 = 0 gives x = −2."], a: "1/3, −2" },
        },
        {
          heading: "Don't round the fraction",
          paras: [
            "1/3 is the exact solution; 0.333 is not. Leave fractions as fractions, reduced.",
            "The other root is usually a whole number, which makes the fractional one look suspicious. It is not — a mixed pair is the normal outcome at this level.",
          ],
          example: { q: "Solve 2x² − 5x − 3 = 0", steps: ["Factor: (2x + 1)(x − 3) = 0.", "2x + 1 = 0 gives x = −1/2.", "x − 3 = 0 gives x = 3."], a: "−1/2, 3" },
        },
        {
          heading: "Checking a fractional root",
          paras: [
            "Substituting a fraction looks unpleasant but is quick. For x = 1/3 in 3x² + 5x − 2: 3(1/9) = 1/3, plus 5/3, minus 2 gives 6/3 − 2 = 0.",
            "If checking the fraction is too fiddly, check the whole-number root instead — an error in the factoring will usually show up there too.",
          ],
        },
      ],
      mistakes: [
        "Reading the root of (3x − 1) as 1 or as 3 rather than 1/3.",
        "Getting the sign of the fractional root backwards — (2x + 1) gives −1/2, not +1/2.",
        "Turning the fraction into a rounded decimal.",
      ],
      recap: [
        "Factor first, exactly as in Crystal level 3.",
        "(ax + b) = 0 gives x = −b/a, which is usually a fraction.",
        "The coefficient becomes the denominator.",
        "Leave fractions exact and reduced, and give both solutions.",
      ],
      practice: [
        { q: "Solve 2x² + 7x + 3 = 0", a: "−1/2, −3" },
        { q: "Solve 3x² − 7x + 2 = 0", a: "1/3, 2" },
        { q: "Solve 4x² + 5x + 1 = 0", a: "−1/4, −1" },
        { q: "Solve 2x² − 3x − 2 = 0", a: "−1/2, 2" },
        { q: "Solve 5x² + 9x − 2 = 0", a: "1/5, −2" },
      ],
    },
  ],

  // ---- Emerald · Complex Numbers -------------------------------------------
  complexIntro: [
    {
      title: "The square root of a negative",
      intro: "√(−49) and its like. Negative numbers have no ordinary square root, so mathematics invents one — and the whole of the Amethyst tier is built on it.",
      sections: [
        {
          heading: "Why i has to exist",
          paras: [
            "No ordinary number squares to give −1: a positive times a positive is positive, and so is a negative times a negative. So √(−1) is not on the number line at all.",
            "Rather than stop there, mathematics gives it a name. i is defined as the number whose square is −1. That single definition is all you need.",
          ],
        },
        {
          heading: "Splitting off the minus",
          paras: [
            "√(−49) can be separated into √49 × √(−1) — the ordinary part and the imaginary part.",
            "√49 is 7 and √(−1) is i, so the answer is 7i. Every question at this level works exactly this way.",
          ],
          example: { q: "Simplify √(−49)", steps: ["Split off the minus: √49 × √(−1).", "√49 = 7.", "√(−1) = i."], a: "7i" },
        },
        {
          heading: "The numbers are all perfect squares",
          paras: [
            "The number under the root is always a perfect square here, so the answer is always a whole number times i. There are no surds to simplify.",
            "That makes this a test of your squares list once again: recognise 144 as 12², and √(−144) is 12i without further thought.",
          ],
          example: { q: "Simplify √(−144)", steps: ["144 is 12².", "The minus becomes i."], a: "12i" },
        },
        {
          heading: "Writing the answer",
          paras: [
            "The number goes in front of the i, as 7i rather than i7. A lone i needs no 1 in front: √(−1) is written i, not 1i.",
            "And i is not a variable — it is a specific constant, like π. It cannot be solved for or cancelled away.",
          ],
        },
      ],
      mistakes: [
        "Giving √(−49) as −7, on the grounds that the minus must go somewhere.",
        "Writing the i under the root, or leaving the answer as √49i.",
        "Treating i as an unknown to be found rather than a fixed number.",
      ],
      recap: [
        "i is defined by i² = −1.",
        "√(−n) = √n × i.",
        "The number under the root is always a perfect square at this level.",
        "Write the number first, then i.",
      ],
      practice: [
        { q: "Simplify √(−25)", a: "5i" },
        { q: "Simplify √(−81)", a: "9i" },
        { q: "Simplify √(−4)", a: "2i" },
        { q: "Simplify √(−121)", a: "11i" },
        { q: "Simplify √(−100)", a: "10i" },
      ],
    },
    {
      title: "Powers of i",
      intro: "Simplify i^27, or i^50. The powers of i repeat in a cycle of four, so however large the exponent, the answer is one of only four possibilities.",
      sections: [
        {
          heading: "The cycle",
          paras: [
            "i¹ = i. i² = −1, by definition. i³ = i² × i = −i. i⁴ = i² × i² = (−1)(−1) = 1.",
            "And then it starts again: i⁵ = i⁴ × i = i. So the sequence i, −1, −i, 1 repeats forever, four rungs at a time.",
          ],
        },
        {
          heading: "Divide by four and keep the remainder",
          paras: [
            "Because the cycle is four long, only the remainder on dividing the exponent by 4 matters. Remainder 1 gives i, remainder 2 gives −1, remainder 3 gives −i, and remainder 0 gives 1.",
            "For i^27: 27 ÷ 4 is 6 remainder 3, so the answer is −i. The 6 complete cycles contribute nothing at all.",
          ],
          example: { q: "Simplify i^27", steps: ["27 ÷ 4 = 6 remainder 3.", "Remainder 3 corresponds to i³.", "i³ = −i."], a: "−i" },
        },
        {
          heading: "Remainder zero",
          paras: [
            "A multiple of 4 leaves remainder 0, which means you have gone round a whole number of times and landed back at 1.",
            "So i^40 = 1, and so does i^100 or i^4000. This is the case people misread, because remainder 0 does not correspond to i⁰ in the list — it corresponds to i⁴.",
          ],
          example: { q: "Simplify i^20", steps: ["20 ÷ 4 = 5 remainder 0.", "A whole number of cycles lands on i⁴."], a: "1" },
        },
        {
          heading: "A faster route for big exponents",
          paras: [
            "You do not need to divide properly — just subtract the largest multiple of 4 you can see. For i^50, note that 48 is a multiple of 4, so 50 leaves 2, and the answer is −1.",
            "Any number ending in 00, or divisible by 4 by the usual test, lands on 1.",
          ],
        },
      ],
      mistakes: [
        "Treating remainder 0 as i⁰ and answering i, rather than 1.",
        "Losing the minus sign on i³, which is −i and not i.",
        "Multiplying the exponent by i, or trying to compute the power directly.",
      ],
      recap: [
        "The cycle is i, −1, −i, 1 and repeats every four.",
        "Divide the exponent by 4 and use the remainder.",
        "Remainders 1, 2, 3, 0 give i, −1, −i, 1.",
        "Only the remainder matters, however big the exponent.",
      ],
      practice: [
        { q: "Simplify i^6", a: "−1" },
        { q: "Simplify i^13", a: "i" },
        { q: "Simplify i^20", a: "1" },
        { q: "Simplify i^31", a: "−i" },
        { q: "Simplify i^50", a: "−1" },
      ],
    },
    {
      title: "The modulus of a complex number",
      intro: "|3 + 4i| = 5. The two vertical bars ask for the size of a complex number — how far it sits from zero — and the answer is always an ordinary positive number.",
      sections: [
        {
          heading: "Complex numbers as points",
          paras: [
            "A complex number a + bi can be drawn as a point: a steps along the real axis and b steps up the imaginary one. 3 + 4i is the point (3, 4).",
            "Its modulus is the straight-line distance from the origin to that point — which is exactly the distance question you solved in Gold.",
          ],
        },
        {
          heading: "It is Pythagoras",
          paras: [
            "|a + bi| = √(a² + b²). The real part and the imaginary part are the two legs of a right triangle, and the modulus is the hypotenuse.",
            "For 3 + 4i: 9 + 16 = 25, and √25 = 5. The familiar 3-4-5 triangle, wearing different notation.",
          ],
          example: { q: "|3 + 4i|", steps: ["Real part 3, imaginary part 4.", "3² + 4² = 9 + 16 = 25.", "√25."], a: "5" },
        },
        {
          heading: "Signs disappear",
          paras: [
            "Both parts get squared, so a minus in either one makes no difference. |−8 + 15i| and |8 − 15i| are both 17.",
            "That is why the modulus is always positive — it is a distance, and distances have no direction.",
          ],
          example: { q: "|−8 + 15i|", steps: ["Real part −8, imaginary part 15.", "(−8)² + 15² = 64 + 225 = 289.", "√289."], a: "17" },
        },
        {
          heading: "The triples come back",
          paras: [
            "The questions are built from the same right triangles as Gold: 3-4-5, 5-12-13, 8-15-17 and 7-24-25.",
            "Seeing 5 and 12 as the two parts should give you 13 immediately, with no squaring at all.",
          ],
        },
      ],
      mistakes: [
        "Adding the two parts instead of squaring them: |3 + 4i| answered as 7.",
        "Leaving an i in the answer — the modulus is an ordinary real number.",
        "Forgetting the square root and giving 25 instead of 5.",
      ],
      recap: [
        "|a + bi| = √(a² + b²).",
        "It is the distance from zero, so it is Pythagoras again.",
        "Squaring removes the signs; the answer is always positive.",
        "Watch for 3-4-5, 5-12-13, 8-15-17 and 7-24-25.",
      ],
      practice: [
        { q: "|5 + 12i|", a: "13" },
        { q: "|8 − 15i|", a: "17" },
        { q: "|−3 − 4i|", a: "5" },
        { q: "|7 + 24i|", a: "25" },
        { q: "|−5 + 12i|", a: "13" },
      ],
    },
  ],

  // ---- Amethyst · Adding Complex Numbers -----------------------------------
  addComplex: [
    {
      title: "Adding complex numbers",
      intro: "(3 + 5i) + (8 + 2i). Two complex numbers, both with positive parts, added together. They add in two separate columns, and that is the whole idea.",
      sections: [
        {
          heading: "Real and imaginary parts do not mix",
          paras: [
            "A complex number a + bi has two halves: the real part a and the imaginary part b. They cannot be combined with each other — 3 + 5i is as simplified as it gets.",
            "That is exactly like 3 apples + 5 oranges. You can count apples with apples and oranges with oranges, and there it stops.",
          ],
        },
        {
          heading: "So add them separately",
          paras: [
            "(a + bi) + (c + di) = (a + c) + (b + d)i. Reals with reals, imaginaries with imaginaries.",
            "For (3 + 5i) + (8 + 2i): 3 + 8 = 11 and 5 + 2 = 7, giving 11 + 7i.",
          ],
          example: { q: "(3 + 5i) + (8 + 2i)", steps: ["Real parts: 3 + 8 = 11.", "Imaginary parts: 5 + 2 = 7.", "Put them back together."], a: "11+7i" },
        },
        {
          heading: "Writing the answer",
          paras: [
            "Always finish in a + bi form: the real part first, then the imaginary part with its i.",
            "A coefficient of 1 needs no digit — write i rather than 1i, exactly as you would write x rather than 1x.",
          ],
          example: { q: "(6 + i) + (2 + 9i)", steps: ["Real parts: 6 + 2 = 8.", "Imaginary parts: 1 + 9 = 10.", "So 8 + 10i."], a: "8+10i" },
        },
        {
          heading: "Why i never multiplies out here",
          paras: [
            "Adding never produces an i², so i² = −1 does not come into it at this level. The i just rides along as a label.",
            "That changes the moment you start multiplying, which is the next subject along. For now, treat i as a unit you are counting.",
          ],
        },
      ],
      mistakes: [
        "Adding a real part to an imaginary part: (3 + 5i) + (8 + 2i) given as 18i.",
        "Combining the two halves into a single number, as though 11 + 7i could be simplified to 18.",
        "Dropping the i from the answer.",
      ],
      recap: [
        "A complex number has a real part and an imaginary part, and they never mix.",
        "(a + bi) + (c + di) = (a + c) + (b + d)i.",
        "Answer in a + bi form, with the real part first.",
        "No i² appears, so nothing turns real.",
      ],
      practice: [
        { q: "(2 + 3i) + (5 + 4i)", a: "7+7i" },
        { q: "(1 + 8i) + (6 + 2i)", a: "7+10i" },
        { q: "(9 + 4i) + (3 + 3i)", a: "12+7i" },
        { q: "(7 + 6i) + (2 + 5i)", a: "9+11i" },
        { q: "(4 + 9i) + (8 + i)", a: "12+10i" },
      ],
    },
    {
      title: "Subtracting complex numbers",
      intro: "(4 − 6i) − (9 + 2i). The same two-column method, but a minus sign now sits in front of a bracket — and it reaches everything inside it.",
      sections: [
        {
          heading: "The minus hits both parts",
          paras: [
            "Subtracting (9 + 2i) means subtracting the 9 and the 2i. Both signs flip, not just the first.",
            "Writing it out as (4 − 6i) − 9 − 2i before combining makes that visible, and it is worth the extra line.",
          ],
          example: { q: "(4 − 6i) − (9 + 2i)", steps: ["Distribute the minus: 4 − 6i − 9 − 2i.", "Real parts: 4 − 9 = −5.", "Imaginary parts: −6 − 2 = −8."], a: "−5−8i" },
        },
        {
          heading: "Subtracting a negative",
          paras: [
            "When the second number already has minus signs, subtracting flips them to plus. (−3 + 7i) − (−5 − 2i) becomes −3 + 7i + 5 + 2i.",
            "That gives 2 + 9i. Two sign flips in one line is where this level catches people, so change the signs first and combine second.",
          ],
          example: { q: "(−3 + 7i) − (−5 − 2i)", steps: ["Distribute the minus: −3 + 7i + 5 + 2i.", "Real parts: −3 + 5 = 2.", "Imaginary parts: 7 + 2 = 9."], a: "2+9i" },
        },
        {
          heading: "When a part vanishes",
          paras: [
            "If the real parts cancel, the answer is purely imaginary and the real part is simply not written: the answer to (−6 − 3i) − (−6 − 8i) is 5i, not 0 + 5i.",
            "The same goes the other way — if the imaginary parts cancel, you are left with an ordinary real number.",
          ],
        },
        {
          heading: "Checking by adding back",
          paras: [
            "Subtraction undoes addition here just as it does with ordinary numbers. Add your answer to the number you subtracted and you should get the first number back.",
            "For (4 − 6i) − (9 + 2i) = −5 − 8i: (−5 − 8i) + (9 + 2i) = 4 − 6i. It checks out.",
          ],
        },
      ],
      mistakes: [
        "Applying the minus only to the real part of the second bracket.",
        "Mishandling a double negative, so −(−2i) comes out as −2i.",
        "Writing 0 + 5i rather than 5i when a part cancels.",
      ],
      recap: [
        "Distribute the minus across both parts of the second bracket first.",
        "Then combine reals with reals and imaginaries with imaginaries.",
        "A cancelled part just disappears from the answer.",
        "Add your answer back to check.",
      ],
      practice: [
        { q: "(8 + 3i) − (2 + 7i)", a: "6−4i" },
        { q: "(5 − 4i) − (9 − 6i)", a: "−4+2i" },
        { q: "(−2 + 6i) − (3 + i)", a: "−5+5i" },
        { q: "(7 − i) − (−4 + 5i)", a: "11−6i" },
        { q: "(−6 − 3i) − (−6 − 8i)", a: "5i" },
      ],
    },
    {
      title: "Chains of additions and subtractions",
      intro: "Three complex numbers at once: (5 + 3i) + (−2 + 8i) − (4 − 6i). Nothing new in the method — only more places for a sign to go astray.",
      sections: [
        {
          heading: "Deal with the signs before combining",
          paras: [
            "Go through the whole expression once and rewrite it without brackets, flipping every sign that a minus reaches.",
            "(5 + 3i) + (−2 + 8i) − (4 − 6i) becomes 5 + 3i − 2 + 8i − 4 + 6i. Note the last term: −(−6i) is +6i.",
          ],
        },
        {
          heading: "Then gather each column",
          paras: [
            "With the brackets gone, sweep through for real parts, then again for imaginary parts. Two passes, each of them simple addition.",
            "Reals: 5 − 2 − 4 = −1. Imaginaries: 3 + 8 + 6 = 17. So the answer is −1 + 17i.",
          ],
          example: { q: "(5 + 3i) + (−2 + 8i) − (4 − 6i)", steps: ["Drop the brackets, flipping signs after the minus: 5 + 3i − 2 + 8i − 4 + 6i.", "Real parts: 5 − 2 − 4 = −1.", "Imaginary parts: 3 + 8 + 6 = 17."], a: "−1+17i" },
        },
        {
          heading: "One column at a time",
          paras: [
            "Resist adding a real and an imaginary in the same step. Finish the reals completely, write the number down, then start on the imaginaries.",
            "Interleaving them is how a term gets counted in the wrong column, and the result still looks like a plausible complex number.",
          ],
          example: { q: "(10 − 4i) + (3 + 7i) − (−2 + 5i)", steps: ["Drop the brackets: 10 − 4i + 3 + 7i + 2 − 5i.", "Real parts: 10 + 3 + 2 = 15.", "Imaginary parts: −4 + 7 − 5 = −2."], a: "15−2i" },
        },
        {
          heading: "A quick check",
          paras: [
            "Count the terms. Three complex numbers means three reals and three imaginaries; if either sweep used fewer, one has been missed.",
            "It is a crude check, but at this level almost every error is a dropped or double-counted term rather than bad arithmetic.",
          ],
        },
      ],
      mistakes: [
        "Flipping the sign of only the first term inside a subtracted bracket.",
        "Missing that −(−6i) becomes +6i.",
        "Adding a real term into the imaginary column while sweeping.",
      ],
      recap: [
        "Rewrite without brackets first, flipping signs as you go.",
        "Then sweep for reals, then sweep for imaginaries.",
        "Never mix the two columns in one step.",
        "Check that each sweep used as many terms as there were numbers.",
      ],
      practice: [
        { q: "(6 + 2i) + (1 + 5i) − (3 + 4i)", a: "4+3i" },
        { q: "(9 − 3i) + (−4 + 8i) − (2 + 2i)", a: "3+3i" },
        { q: "(−5 + 7i) + (8 − 2i) − (1 + 3i)", a: "2+2i" },
        { q: "(12 + i) + (−3 − 9i) − (4 − 5i)", a: "5−3i" },
        { q: "(2 − 8i) + (7 + 6i) − (−1 − 4i)", a: "10+2i" },
      ],
    },
  ],

  // ---- Amethyst · Multiplying Complex Numbers ------------------------------
  mulComplex: [
    {
      title: "Multiplying by a real number",
      intro: "4(3 − 5i). A plain number multiplying a complex one. It reaches both parts, and no i² appears — which makes this the gentle introduction before the real thing.",
      sections: [
        {
          heading: "Distribute across both parts",
          paras: [
            "k(a + bi) = ka + kbi. The multiplier hits the real part and the imaginary part alike.",
            "4(3 − 5i) is 12 − 20i. It is the same distribution you did with brackets in Silver, with an i attached to one of the terms.",
          ],
          example: { q: "4(3 − 5i)", steps: ["Multiply the real part: 4 × 3 = 12.", "Multiply the imaginary part: 4 × (−5) = −20."], a: "12−20i" },
        },
        {
          heading: "Negative multipliers",
          paras: [
            "A negative outside flips both signs. −3(2 + 7i) gives −6 − 21i.",
            "Both terms change, which is easy to say and easy to half-do. Multiply each part on its own line if the signs are getting away from you.",
          ],
          example: { q: "−3(2 + 7i)", steps: ["Real part: −3 × 2 = −6.", "Imaginary part: −3 × 7 = −21."], a: "−6−21i" },
        },
        {
          heading: "Still no i²",
          paras: [
            "Only one of the two numbers has an i in it, so nothing ever gets multiplied by i twice. The i² rule stays in its box for one more level.",
            "That is exactly why this level exists first: it separates the distribution from the i² substitution, so you only learn one new thing at a time.",
          ],
        },
        {
          heading: "Reading the shape",
          paras: [
            "Scaling a complex number stretches it away from zero without turning it. 3 + 4i has modulus 5, so 2(3 + 4i) = 6 + 8i has modulus 10.",
            "That is a useful sanity check: multiplying by k multiplies the modulus by k as well.",
          ],
        },
      ],
      mistakes: [
        "Multiplying only the real part and leaving the imaginary one untouched.",
        "Losing a sign when the multiplier is negative.",
        "Introducing an i² that is not there.",
      ],
      recap: [
        "k(a + bi) = ka + kbi.",
        "The multiplier reaches both parts.",
        "A negative multiplier flips both signs.",
        "No i² arises, because only one factor carries an i.",
      ],
      practice: [
        { q: "5(2 + 3i)", a: "10+15i" },
        { q: "−2(4 − 6i)", a: "−8+12i" },
        { q: "6(−1 + 2i)", a: "−6+12i" },
        { q: "3(−5 − 4i)", a: "−15−12i" },
        { q: "−4(3 + i)", a: "−12−4i" },
      ],
    },
    {
      title: "Multiplying two complex numbers",
      intro: "(2 + 3i)(4 − 5i). Both factors now carry an i, so one of the four products contains i² — and that is where the number turns partly real.",
      sections: [
        {
          heading: "Expand as you would any brackets",
          paras: [
            "(a + bi)(c + di) has four products, exactly like (ax + b)(cx + d) in Emerald: ac, adi, bci and bdi².",
            "For (2 + 3i)(4 − 5i): 8, then −10i, then 12i, then −15i². Three of those are ordinary; the last one is not.",
          ],
        },
        {
          heading: "Then use i² = −1",
          paras: [
            "The bdi² term is the whole difference between this and expanding ordinary brackets. Since i² = −1, that term becomes −bd — a real number.",
            "In our example −15i² becomes +15, which joins the 8 to make a real part of 23. The two middle terms give −10i + 12i = 2i, so the answer is 23 + 2i.",
          ],
          example: { q: "(2 + 3i)(4 − 5i)", steps: ["Four products: 8, −10i, 12i, −15i².", "i² = −1, so −15i² = +15.", "Reals: 8 + 15 = 23. Imaginaries: −10 + 12 = 2."], a: "23+2i" },
        },
        {
          heading: "The formula, if you prefer",
          paras: [
            "Doing that in general gives (a + bi)(c + di) = (ac − bd) + (ad + bc)i. The minus in ac − bd is the i² already folded in.",
            "It is worth knowing, but expanding by hand is safer until the i² step feels automatic — the formula hides the very thing you need to remember.",
          ],
          example: { q: "(−1 + 4i)(3 + 2i)", steps: ["Real part: (−1)(3) − (4)(2) = −3 − 8 = −11.", "Imaginary part: (−1)(2) + (4)(3) = −2 + 12 = 10."], a: "−11+10i" },
        },
        {
          heading: "When the answer is real",
          paras: [
            "Sometimes the two imaginary terms cancel and the answer has no i at all. (4 + i)(4 − i) gives −4i + 4i = 0 in the middle, leaving 16 + 1 = 17.",
            "That is not a mistake — it is the conjugate pattern, and it is the whole subject of the next topic.",
          ],
        },
      ],
      mistakes: [
        "Forgetting i² = −1 and leaving an i² in the answer.",
        "Getting the sign of the i² term backwards, so the real part comes out as ac + bd.",
        "Missing one of the two cross terms.",
      ],
      recap: [
        "Four products, exactly as with ordinary brackets.",
        "The i² term becomes real: i² = −1.",
        "(a + bi)(c + di) = (ac − bd) + (ad + bc)i.",
        "A purely real answer means the cross terms cancelled.",
      ],
      practice: [
        { q: "(1 + 2i)(3 + 4i)", a: "−5+10i" },
        { q: "(5 − i)(2 + 3i)", a: "13+13i" },
        { q: "(−2 + 3i)(1 − 4i)", a: "10+11i" },
        { q: "(4 + i)(4 − i)", a: "17" },
        { q: "(3 − 2i)(−1 + 5i)", a: "7+17i" },
      ],
    },
    {
      title: "Squaring a complex number",
      intro: "(3 − 4i)². A special case of multiplying, with the same shortcut you learned for (ax + b)² — and the same trap of forgetting the middle term.",
      sections: [
        {
          heading: "It is a bracket times itself",
          paras: [
            "(3 − 4i)² means (3 − 4i)(3 − 4i). If the pattern escapes you, write it out twice and expand normally — it always works.",
            "What it is not is 9 + 16i². Squaring a sum is never the sum of the squares, here or anywhere else.",
          ],
        },
        {
          heading: "The pattern",
          paras: [
            "(a + bi)² = (a² − b²) + 2abi. Square each part for the real half — with a minus, because b² came from an i² — and double the product for the imaginary half.",
            "For (3 − 4i): a = 3 and b = −4, so the real part is 9 − 16 = −7 and the imaginary part is 2 × 3 × (−4) = −24.",
          ],
          example: { q: "(3 − 4i)²", steps: ["a = 3, b = −4.", "Real: a² − b² = 9 − 16 = −7.", "Imaginary: 2ab = 2 × 3 × (−4) = −24."], a: "−7−24i" },
        },
        {
          heading: "Where the minus comes from",
          paras: [
            "Expanding gives a² + 2abi + b²i². That last term is b² × (−1) = −b², which is why the real part is a² − b² rather than a² + b².",
            "So the minus is not an extra rule to memorise; it is i² doing what it always does.",
          ],
          example: { q: "(5 + 2i)²", steps: ["a = 5, b = 2.", "Real: 25 − 4 = 21.", "Imaginary: 2 × 5 × 2 = 20."], a: "21+20i" },
        },
        {
          heading: "Signs in b",
          paras: [
            "Carry the sign into b rather than treating it separately. For (−4 + 2i), a = −4 and b = 2, giving a real part of 16 − 4 = 12 and an imaginary part of 2(−4)(2) = −16.",
            "Because b is squared, its sign never affects the real part — only the middle term can come out negative.",
          ],
        },
      ],
      mistakes: [
        "Squaring each part and dropping the middle: (3 − 4i)² given as 9 + 16.",
        "Using a² + b² for the real part and losing the i².",
        "Forgetting to double the cross term.",
      ],
      recap: [
        "(a + bi)² = (a² − b²) + 2abi.",
        "The real part subtracts because b²i² = −b².",
        "The imaginary part is twice the product of the two parts.",
        "When in doubt, write the bracket twice and expand.",
      ],
      practice: [
        { q: "(2 + 3i)²", a: "−5+12i" },
        { q: "(1 − 5i)²", a: "−24−10i" },
        { q: "(6 + i)²", a: "35+12i" },
        { q: "(−4 + 2i)²", a: "12−16i" },
        { q: "(7 − 3i)²", a: "40−42i" },
      ],
    },
  ],

  // ---- Amethyst · Conjugates -----------------------------------------------
  conjugates: [
    {
      title: "Finding a conjugate",
      intro: "The conjugate of −6 + 7i is −6 − 7i. One sign changes and nothing else does. It is the simplest operation in the tier, and the most useful.",
      sections: [
        {
          heading: "Flip the imaginary sign",
          paras: [
            "The conjugate of a + bi is a − bi. The real part is untouched; only the sign in front of the i changes.",
            "So the conjugate of 3 + 8i is 3 − 8i, and the conjugate of 7 − 4i is 7 + 4i. It works both ways — conjugating twice gets you back where you started.",
          ],
          example: { q: "Conjugate of −6 + 7i", steps: ["The real part stays as it is: −6.", "The imaginary sign flips: +7i becomes −7i."], a: "−6−7i" },
        },
        {
          heading: "The real part really does not move",
          paras: [
            "A negative real part stays negative. The conjugate of −5 + 2i is −5 − 2i, not 5 − 2i.",
            "That is the one error worth guarding against here: the instinct is to flip every sign in sight, and only one of them changes.",
          ],
          example: { q: "Conjugate of 4 − 9i", steps: ["Real part unchanged: 4.", "Imaginary sign flips: −9i becomes +9i."], a: "4+9i" },
        },
        {
          heading: "What it means geometrically",
          paras: [
            "Drawn as a point, conjugating reflects a complex number across the real axis. 3 + 4i sits above the line and 3 − 4i sits the same distance below it.",
            "So a number and its conjugate always have the same modulus — the same distance from zero.",
          ],
        },
        {
          heading: "Why it matters",
          paras: [
            "Conjugates exist because multiplying one by its partner destroys the i entirely, leaving an ordinary real number. That is the next level, and it is what makes division possible.",
            "Everything in the rest of this tier leans on this one small operation.",
          ],
        },
      ],
      mistakes: [
        "Flipping the sign of the real part too.",
        "Flipping nothing when the imaginary part is already negative — it still changes, to positive.",
        "Dropping the i when the coefficient is 1: the conjugate of 9 + i is 9 − i.",
      ],
      recap: [
        "The conjugate of a + bi is a − bi.",
        "Only the imaginary sign changes.",
        "Conjugating twice returns the original number.",
        "A number and its conjugate have the same modulus.",
      ],
      practice: [
        { q: "Conjugate of 3 + 8i", a: "3−8i" },
        { q: "Conjugate of −5 + 2i", a: "−5−2i" },
        { q: "Conjugate of 7 − 4i", a: "7+4i" },
        { q: "Conjugate of −1 − 6i", a: "−1+6i" },
        { q: "Conjugate of 9 + i", a: "9−i" },
      ],
    },
    {
      title: "Multiplying a number by its conjugate",
      intro: "(5 + 2i)(5 − 2i) = 29. The i vanishes completely, and the answer is always an ordinary positive whole number. This is the property the whole tier is built on.",
      sections: [
        {
          heading: "The middle terms cancel",
          paras: [
            "Expand (a + bi)(a − bi) and the two cross terms are −abi and +abi. They are equal and opposite, so they cancel exactly.",
            "What remains is a² − b²i², and since i² = −1 that is a² + b². No i survives.",
          ],
          example: { q: "(5 + 2i)(5 − 2i)", steps: ["Cross terms: −10i and +10i, which cancel.", "What is left: 25 − 4i².", "i² = −1, so −4i² = +4. 25 + 4."], a: "29" },
        },
        {
          heading: "Plus, not minus",
          paras: [
            "The formula is a² + b², even though the brackets contain a minus. The two minus signs — one in the bracket, one from i² — cancel each other.",
            "This is the single most common error in the topic. Write it down as a fact: a number times its conjugate is a² + b².",
          ],
          example: { q: "(−3 + 7i)(−3 − 7i)", steps: ["a = −3, b = 7.", "a² + b² = 9 + 49."], a: "58" },
        },
        {
          heading: "The answer is the modulus squared",
          paras: [
            "a² + b² is exactly what sits under the square root in |a + bi|. So multiplying by the conjugate gives the square of the modulus.",
            "(3 + 4i)(3 − 4i) = 25, and |3 + 4i| = 5. That connection is worth holding on to — it says the conjugate measures size.",
          ],
        },
        {
          heading: "It can never be negative",
          paras: [
            "Both a² and b² are squares, so the total is always positive (or zero, only if the number itself was zero).",
            "That gives you a free check: a negative answer here always means a sign error somewhere.",
          ],
        },
      ],
      mistakes: [
        "Computing a² − b² and forgetting that i² already supplied a minus.",
        "Leaving an i in the answer when the whole point is that it cancels.",
        "Squaring the whole bracket instead of multiplying the two different brackets.",
      ],
      recap: [
        "(a + bi)(a − bi) = a² + b².",
        "The cross terms cancel and i² turns −b² into +b².",
        "The answer is always a positive real number.",
        "It equals the modulus squared.",
      ],
      practice: [
        { q: "(4 + 3i)(4 − 3i)", a: "25" },
        { q: "(6 + 5i)(6 − 5i)", a: "61" },
        { q: "(−2 + 9i)(−2 − 9i)", a: "85" },
        { q: "(8 − i)(8 + i)", a: "65" },
        { q: "(7 + 7i)(7 − 7i)", a: "98" },
      ],
    },
    {
      title: "The conjugate of a product",
      intro: "“Conjugate of (2 + 3i)(4 − 5i)?” Two ways to get there, and one of them is much less work than the other.",
      sections: [
        {
          heading: "The direct route",
          paras: [
            "Multiply the two numbers out first, then conjugate the result. (2 + 3i)(4 − 5i) = 23 + 2i, so the conjugate is 23 − 2i.",
            "This always works and needs no new ideas — it is level 2 of multiplying followed by level 1 of conjugating.",
          ],
          example: { q: "Conjugate of (2 + 3i)(4 − 5i)?", steps: ["Multiply: real 8 + 15 = 23, imaginary −10 + 12 = 2, giving 23 + 2i.", "Now flip the imaginary sign."], a: "23−2i" },
        },
        {
          heading: "The shortcut",
          paras: [
            "The conjugate of a product equals the product of the conjugates. So you can conjugate each bracket first and then multiply.",
            "(2 − 3i)(4 + 5i) gives real 8 + 15 = 23 and imaginary 10 − 12 = −2, so 23 − 2i. Same answer, and sometimes easier signs to work with.",
          ],
        },
        {
          heading: "Why that works",
          paras: [
            "Conjugating flips the sign of every i in an expression. Multiplication only ever combines i terms by adding or multiplying them, and both operations respect that flip.",
            "So it makes no difference whether you flip at the start or at the end — the result is identical.",
          ],
          example: { q: "Conjugate of (1 + 2i)(3 + 4i)?", steps: ["Multiply first: real 3 − 8 = −5, imaginary 4 + 6 = 10, giving −5 + 10i.", "Conjugate that."], a: "−5−10i" },
        },
        {
          heading: "Which to use",
          paras: [
            "Either. Multiplying first is usually less error-prone because it is the route you already practise; conjugating first can be quicker when it turns awkward negatives into positives.",
            "Doing it both ways is also a complete check on your answer, at the cost of one extra multiplication.",
          ],
        },
      ],
      mistakes: [
        "Conjugating only one of the two brackets.",
        "Conjugating the product and then conjugating again out of habit, returning to the original.",
        "Making a sign error in the multiplication that the conjugation then hides.",
      ],
      recap: [
        "Multiply, then flip the sign of the imaginary part.",
        "Or conjugate both brackets first and multiply — same answer.",
        "The conjugate of a product is the product of the conjugates.",
        "Doing it both ways is a free check.",
      ],
      practice: [
        { q: "Conjugate of (2 + i)(3 + 2i)?", a: "4−7i" },
        { q: "Conjugate of (5 − 2i)(1 + 3i)?", a: "11−13i" },
        { q: "Conjugate of (−1 + 4i)(2 − i)?", a: "2−9i" },
        { q: "Conjugate of (3 + 3i)(3 − 3i)?", a: "18" },
        { q: "Conjugate of (4 − i)(−2 + 5i)?", a: "−3−22i" },
      ],
    },
  ],

  // ---- Amethyst · Dividing Complex Numbers ---------------------------------
  divComplex: [
    {
      title: "Dividing by a real number",
      intro: "(12 − 18i) ÷ 6. An ordinary number on the bottom, so there is no i to clear. Divide each part and you are done.",
      sections: [
        {
          heading: "Split the fraction",
          paras: [
            "(a + bi) ÷ k is the same as a/k + (b/k)i. The division reaches both parts, exactly as multiplication did.",
            "(12 − 18i) ÷ 6 gives 12 ÷ 6 = 2 and −18 ÷ 6 = −3, so the answer is 2 − 3i.",
          ],
          example: { q: "(12 − 18i) ÷ 6", steps: ["Real part: 12 ÷ 6 = 2.", "Imaginary part: −18 ÷ 6 = −3."], a: "2−3i" },
        },
        {
          heading: "Both parts always divide evenly here",
          paras: [
            "The questions at this level are built so that both parts come out whole. If one of them does not, something has gone wrong earlier.",
            "That makes it a useful self-check: a fraction appearing at this level is a signal, not a result.",
          ],
          example: { q: "(−20 + 35i) ÷ 5", steps: ["Real part: −20 ÷ 5 = −4.", "Imaginary part: 35 ÷ 5 = 7."], a: "−4+7i" },
        },
        {
          heading: "Signs",
          paras: [
            "Each part keeps its own sign through the division. A negative divided by a positive stays negative, and the two parts are independent.",
            "(−14 − 21i) ÷ 7 gives −2 − 3i: both parts negative, both divided separately.",
          ],
        },
        {
          heading: "Checking by multiplying back",
          paras: [
            "Multiply your answer by the divisor and you should recover the original. (2 − 3i) × 6 = 12 − 18i. Correct.",
            "That check is the level 1 multiplication you already know, so it costs almost nothing.",
          ],
        },
      ],
      mistakes: [
        "Dividing only the real part.",
        "Dividing the real part but multiplying the imaginary one, or vice versa.",
        "Losing a sign on one of the two parts.",
      ],
      recap: [
        "(a + bi) ÷ k = (a/k) + (b/k)i.",
        "Both parts are divided, independently.",
        "At this level both come out whole.",
        "Multiply back to check.",
      ],
      practice: [
        { q: "(8 + 12i) ÷ 4", a: "2+3i" },
        { q: "(−15 + 25i) ÷ 5", a: "−3+5i" },
        { q: "(18 − 24i) ÷ 6", a: "3−4i" },
        { q: "(−14 − 21i) ÷ 7", a: "−2−3i" },
        { q: "(9 + 27i) ÷ 3", a: "3+9i" },
      ],
    },
    {
      title: "Dividing by a complex number",
      intro: "(1 + 7i) ÷ (3 + i). There is now an i on the bottom, and an answer is not finished while that is true. The conjugate is what clears it.",
      sections: [
        {
          heading: "You cannot leave i downstairs",
          paras: [
            "A complex number must end up in a + bi form, and a fraction with i in the denominator is not in that form.",
            "So the job is to turn the bottom into an ordinary real number without changing the value of the whole thing.",
          ],
        },
        {
          heading: "Multiply top and bottom by the conjugate",
          paras: [
            "Multiplying the denominator by its conjugate makes it real — that is exactly what the previous topic proved. And multiplying the numerator by the same thing keeps the fraction's value unchanged, because you have multiplied by 1 in disguise.",
            "For (1 + 7i) ÷ (3 + i), the conjugate of the bottom is 3 − i. Multiply both parts by it.",
          ],
          example: { q: "(1 + 7i) ÷ (3 + i)", steps: ["Conjugate of the bottom is 3 − i; multiply top and bottom by it.", "Bottom: 3² + 1² = 10.", "Top: (1 + 7i)(3 − i) = 3 − i + 21i + 7 = 10 + 20i.", "Divide both parts by 10."], a: "1+2i" },
        },
        {
          heading: "The bottom is a² + b², always",
          paras: [
            "You never need to expand the denominator properly. It is the number times its conjugate, so it is the sum of the squares of its two parts.",
            "For 3 + i that is 9 + 1 = 10. For 5 − 2i it would be 25 + 4 = 29. One line, no brackets.",
          ],
          example: { q: "(11 + 13i) ÷ (5 − 2i)", steps: ["Conjugate of the bottom is 5 + 2i.", "Bottom: 25 + 4 = 29.", "Top: (11 + 13i)(5 + 2i) = 55 + 22i + 65i − 26 = 29 + 87i.", "Divide by 29."], a: "1+3i" },
        },
        {
          heading: "Finish by splitting the fraction",
          paras: [
            "Once the bottom is real, you are back at level 1: divide each part of the top by it.",
            "The questions here are built so both parts divide exactly, so a leftover fraction usually means an arithmetic slip in the numerator.",
          ],
        },
      ],
      mistakes: [
        "Multiplying only the denominator by the conjugate, which changes the value of the fraction.",
        "Using the conjugate of the numerator instead of the denominator.",
        "Expanding the denominator by hand and picking up a sign error, when a² + b² would have done it.",
      ],
      recap: [
        "An answer with i on the bottom is not finished.",
        "Multiply top and bottom by the conjugate of the denominator.",
        "The new denominator is a² + b².",
        "Then divide both parts of the numerator by it.",
      ],
      practice: [
        { q: "(4 + 7i) ÷ (3 + 2i)", a: "2+i" },
        { q: "(4 − 3i) ÷ (2 + i)", a: "1−2i" },
        { q: "(4 − 2i) ÷ (1 − i)", a: "3+i" },
        { q: "(−8 + i) ÷ (2 + 3i)", a: "−1+2i" },
        { q: "(8 + i) ÷ (1 + 2i)", a: "2−3i" },
      ],
    },
    {
      title: "Division with larger numbers",
      intro: "The same conjugate method, written with a slash and with bigger parts — (13 + 18i)/(2 + 5i). Nothing changes except the size of the arithmetic.",
      sections: [
        {
          heading: "The method does not grow",
          paras: [
            "Conjugate of the bottom, multiply top and bottom, denominator becomes a² + b², divide through. Four steps, however large the numbers.",
            "What grows is the numerator multiplication, which is where the care is needed.",
          ],
          example: { q: "(13 + 18i)/(2 + 5i)", steps: ["Conjugate: 2 − 5i.", "Bottom: 4 + 25 = 29.", "Top: (13 + 18i)(2 − 5i) = 26 − 65i + 36i + 90 = 116 − 29i.", "Divide by 29."], a: "4−i" },
        },
        {
          heading: "Do the numerator in two halves",
          paras: [
            "Work out the real part and the imaginary part of the top separately, using (ac − bd) and (ad + bc), and write each down before dividing.",
            "Trying to expand all four products in your head is where this level goes wrong. The numbers are large enough that a dropped sign is invisible.",
          ],
          example: { q: "(−5 + 14i)/(4 − i)", steps: ["Conjugate: 4 + i.", "Bottom: 16 + 1 = 17.", "Top real: (−5)(4) − (14)(1) = −20 − 14 = −34.", "Top imaginary: (−5)(1) + (14)(4) = −5 + 56 = 51. So (−34 + 51i)/17."], a: "−2+3i" },
        },
        {
          heading: "The denominator is your check",
          paras: [
            "Both parts of the numerator must divide exactly by a² + b². If they do not, the numerator arithmetic is wrong — the denominator is almost never the problem.",
            "So a non-dividing result tells you exactly where to look, which saves re-doing the whole thing.",
          ],
        },
        {
          heading: "Verify by multiplying back",
          paras: [
            "Multiply your answer by the original denominator and you should recover the numerator. For (13 + 18i)/(2 + 5i) = 4 − i: (4 − i)(2 + 5i) = 8 + 20i − 2i + 5 = 13 + 18i.",
            "At this size that check is genuinely worth the thirty seconds.",
          ],
        },
      ],
      mistakes: [
        "Expanding the numerator all at once and losing a term.",
        "Using a² − b² for the denominator.",
        "Accepting an answer whose parts did not divide exactly.",
      ],
      recap: [
        "Same four steps as level 2, larger numbers.",
        "Compute the numerator's real and imaginary parts separately.",
        "The denominator is a² + b² and both parts must divide by it exactly.",
        "Multiply back to verify.",
      ],
      practice: [
        { q: "(23 − 14i)/(3 − 4i)", a: "5+2i" },
        { q: "(−4 − 8i)/(2 + 2i)", a: "−3−i" },
        { q: "(12 + 16i)/(1 + 3i)", a: "6−2i" },
        { q: "(−6 + 22i)/(4 + 2i)", a: "1+5i" },
        { q: "(−15 − 9i)/(3 + 3i)", a: "−4+i" },
      ],
    },
  ],

  // ---- Ruby · Graphing Quadratics ------------------------------------------
  graphQuad: [
    {
      title: "The vertex from completed square form",
      intro: "“Vertex of y = (x − 3)² + 5?” The equation is already in the most convenient form there is, and the vertex can be read straight off it — as long as you handle one sign correctly.",
      sections: [
        {
          heading: "What the vertex is",
          paras: [
            "A parabola is a symmetric U (or an upside-down one). The vertex is its turning point — the very bottom of the U, or the very top.",
            "It is a point, so the answer has two numbers, written (h, k).",
          ],
        },
        {
          heading: "Reading it off",
          paras: [
            "y = (x − h)² + k has its vertex at (h, k). The k is easy: it is the number outside, copied as it stands.",
            "The h is the trap. The form has a minus in it, so (x − 3)² gives h = 3 — but (x + 4)² has to be read as (x − (−4))², giving h = −4. The sign inside flips.",
          ],
          example: { q: "Vertex of y = (x − 3)² + 5?", steps: ["The bracket reads x − 3, so h = 3.", "The number outside is +5, so k = 5."], a: "(3, 5)" },
        },
        {
          heading: "Both signs at once",
          paras: [
            "y = (x + 4)² − 7 has a plus inside and a minus outside. The inside flips and the outside does not, so the vertex is (−4, −7).",
            "Say it out loud as you read: “inside flips, outside copies”. Almost every error at this level is one of those two rules applied to the wrong half.",
          ],
          example: { q: "Vertex of y = (x + 4)² − 7?", steps: ["Inside is x + 4, which is x − (−4), so h = −4.", "Outside is −7, so k = −7."], a: "(−4, −7)" },
        },
        {
          heading: "Why the sign flips",
          paras: [
            "The squared bracket is smallest when it is zero, and (x − 3)² is zero when x = 3. That x is where the turning point sits.",
            "So h is the value of x that empties the bracket — which is why the sign comes out opposite to the one written.",
          ],
        },
      ],
      mistakes: [
        "Reading (x + 4)² as h = 4 instead of −4.",
        "Flipping the sign of k as well as h.",
        "Giving only one of the two coordinates.",
      ],
      recap: [
        "y = (x − h)² + k has vertex (h, k).",
        "Inside the bracket the sign flips; outside it does not.",
        "h is the x value that makes the bracket zero.",
        "Answer with both coordinates, as (h, k).",
      ],
      practice: [
        { q: "Vertex of y = (x − 2)² + 6?", a: "(2, 6)" },
        { q: "Vertex of y = (x + 5)² − 3?", a: "(−5, −3)" },
        { q: "Vertex of y = (x − 7)² − 1?", a: "(7, −1)" },
        { q: "Vertex of y = (x + 1)² + 9?", a: "(−1, 9)" },
        { q: "Vertex of y = (x − 4)² + 4?", a: "(4, 4)" },
      ],
    },
    {
      title: "The vertex from standard form",
      intro: "“Vertex of y = x² − 6x + 11?” The bracket has been multiplied out, so the vertex is no longer visible. One short formula recovers it.",
      sections: [
        {
          heading: "The axis of symmetry",
          paras: [
            "For y = ax² + bx + c, the turning point sits at x = −b/(2a). That number is the h of the vertex.",
            "For y = x² − 6x + 11: a = 1 and b = −6, so h = 6/2 = 3.",
          ],
        },
        {
          heading: "Then substitute for k",
          paras: [
            "Once you have h, put it back into the equation to find the y value there. That is what k is: the height of the curve at its turning point.",
            "At x = 3: 9 − 18 + 11 = 2. So the vertex is (3, 2).",
          ],
          example: { q: "Vertex of y = x² − 6x + 11?", steps: ["h = −b/(2a) = 6/2 = 3.", "Substitute: 3² − 6(3) + 11 = 9 − 18 + 11 = 2."], a: "(3, 2)" },
        },
        {
          heading: "When a is not 1",
          paras: [
            "The formula already accounts for it — just remember the 2a on the bottom, not 2. For y = 2x² + 8x + 5: h = −8/4 = −2.",
            "Then substitute as usual: 2(4) + 8(−2) + 5 = 8 − 16 + 5 = −3, so the vertex is (−2, −3).",
          ],
          example: { q: "Vertex of y = 2x² + 8x + 5?", steps: ["h = −b/(2a) = −8/(2 × 2) = −2.", "Substitute: 2(−2)² + 8(−2) + 5 = 8 − 16 + 5 = −3."], a: "(−2, −3)" },
        },
        {
          heading: "Negative a",
          paras: [
            "If a is negative the parabola opens downwards and the vertex is a maximum rather than a minimum, but the formula is unchanged.",
            "For y = −x² + 2x + 3: h = −2/(2 × −1) = 1, and substituting gives −1 + 2 + 3 = 4. The vertex is (1, 4).",
          ],
        },
      ],
      mistakes: [
        "Dividing by 2 instead of 2a.",
        "Forgetting the minus in −b, so the h comes out with the wrong sign.",
        "Finding h and stopping, without substituting back for k.",
      ],
      recap: [
        "h = −b/(2a).",
        "Substitute h back into the equation to get k.",
        "The 2a matters whenever a is not 1.",
        "A negative a flips the parabola but not the method.",
      ],
      practice: [
        { q: "Vertex of y = x² − 4x + 7?", a: "(2, 3)" },
        { q: "Vertex of y = x² + 6x + 5?", a: "(−3, −4)" },
        { q: "Vertex of y = 2x² − 12x + 13?", a: "(3, −5)" },
        { q: "Vertex of y = −x² + 2x + 3?", a: "(1, 4)" },
        { q: "Vertex of y = 3x² + 12x + 7?", a: "(−2, −5)" },
      ],
    },
    {
      title: "Where the parabola crosses the x-axis",
      intro: "“x-intercepts of y = x² − x − 12?” The curve meets the x-axis where y is zero, so this is the Emerald quadratic-solving you already know, asked as a graph question.",
      sections: [
        {
          heading: "Crossing means y = 0",
          paras: [
            "The x-axis is the line y = 0, so the crossing points are the x values that make the equation zero.",
            "Set y = 0 and you have x² − x − 12 = 0 — an ordinary quadratic to solve by factoring.",
          ],
        },
        {
          heading: "Factor and read off the roots",
          paras: [
            "Two numbers multiplying to −12 and adding to −1 are 3 and −4, so the equation factors as (x + 3)(x − 4) = 0.",
            "Each bracket gives a crossing point, with the sign flipped: x = −3 and x = 4.",
          ],
          example: { q: "x-intercepts of y = x² − x − 12?", steps: ["Set y = 0: x² − x − 12 = 0.", "Factor: (x + 3)(x − 4) = 0.", "x + 3 = 0 gives −3; x − 4 = 0 gives 4."], a: "−3, 4" },
        },
        {
          heading: "There are two of them",
          paras: [
            "A parabola that crosses the axis crosses it twice, once on each side of the vertex. The question wants both, comma-separated, and the order does not matter.",
            "That is also a sanity check: the vertex sits exactly halfway between them. For roots −3 and 4 the vertex is at x = 0.5.",
          ],
          example: { q: "x-intercepts of y = x² − 9x + 20?", steps: ["Set y = 0: x² − 9x + 20 = 0.", "Two numbers multiplying to 20 and adding to −9: −4 and −5.", "(x − 4)(x − 5) = 0."], a: "4, 5" },
        },
        {
          heading: "Checking",
          paras: [
            "Substitute each root back into the original equation; both should give y = 0.",
            "For x = 4 in y = x² − x − 12: 16 − 4 − 12 = 0. Correct.",
          ],
        },
      ],
      mistakes: [
        "Giving the numbers inside the brackets without flipping their signs.",
        "Finding one root and stopping.",
        "Solving for the vertex instead of the intercepts — read which the question asked for.",
      ],
      recap: [
        "The x-intercepts are where y = 0.",
        "Factor the quadratic and set each bracket to zero.",
        "(x + p) = 0 gives x = −p.",
        "Two roots, and the vertex sits midway between them.",
      ],
      practice: [
        { q: "x-intercepts of y = x² − 5x + 6?", a: "2, 3" },
        { q: "x-intercepts of y = x² + 2x − 15?", a: "3, −5" },
        { q: "x-intercepts of y = x² − 7x + 10?", a: "2, 5" },
        { q: "x-intercepts of y = x² + 8x + 12?", a: "−2, −6" },
        { q: "x-intercepts of y = x² − 3x − 18?", a: "6, −3" },
      ],
    },
  ],

  // ---- Ruby · Statistics I -------------------------------------------------
  stats1: [
    {
      title: "The mean",
      intro: "“Mean of 12, 19, 7, 22, 15?” The mean is the everyday average: total the numbers and share the total out equally.",
      sections: [
        {
          heading: "Add, then divide",
          paras: [
            "The mean is the sum of all the values divided by how many there are. Nothing more.",
            "For 12, 19, 7, 22, 15: the total is 75, and there are five values, so the mean is 15.",
          ],
          example: { q: "Mean of 12, 19, 7, 22, 15", steps: ["Add them: 12 + 19 + 7 + 22 + 15 = 75.", "There are 5 values.", "75 ÷ 5."], a: "15" },
        },
        {
          heading: "Count the values carefully",
          paras: [
            "Dividing by the wrong count is the commonest error, and it happens most when a value repeats — repeats still count separately.",
            "Count the numbers before you start adding, and write the count down. It is one digit and it saves recounting a long list.",
          ],
        },
        {
          heading: "What it means",
          paras: [
            "The mean is where the values would sit if you levelled them all out — took from the big ones and gave to the small ones until every value was the same.",
            "That gives you a check: the mean must lie between the smallest and largest value. If it does not, the arithmetic is wrong.",
          ],
        },
        {
          heading: "Adding in a helpful order",
          paras: [
            "You are free to add in whatever order is easiest. Look for pairs that make round numbers — in 3, 7, 11, 9, 5 the 3 and 7 make 10, and the 11 and 9 make 20.",
            "That leaves 10 + 20 + 5 = 35, and 35 ÷ 5 = 7, all without writing anything down.",
          ],
          example: { q: "Mean of 3, 7, 11, 9, 5", steps: ["Pair them up: 3 + 7 = 10 and 11 + 9 = 20.", "Total: 10 + 20 + 5 = 35.", "35 ÷ 5."], a: "7" },
        },
      ],
      mistakes: [
        "Dividing by the wrong number of values, especially when one value repeats.",
        "Making an addition slip in a long list — pair the numbers to make it easier.",
        "Confusing the mean with the median, which needs the list sorted instead.",
      ],
      recap: [
        "Mean = total ÷ how many.",
        "Count the values before adding, and count repeats separately.",
        "The mean always lies between the smallest and largest value.",
        "Add in whatever order makes round numbers.",
      ],
      practice: [
        { q: "Mean of 4, 8, 12, 16, 20", a: "12" },
        { q: "Mean of 10, 20, 30, 40, 50", a: "30" },
        { q: "Mean of 3, 7, 11, 9, 5", a: "7" },
        { q: "Mean of 21, 18, 24, 19, 23", a: "21" },
        { q: "Mean of 6, 14, 2, 18, 10", a: "10" },
      ],
    },
    {
      title: "The median",
      intro: "“Median of 9, 3, 14, 7, 5?” The median is the middle value — but only once the list is in order, which is the step everyone skips.",
      sections: [
        {
          heading: "Sort first, always",
          paras: [
            "The median is the middle of the sorted list, not the middle of the list as written. 9, 3, 14, 7, 5 has 14 in the middle position, and 14 is not the median.",
            "Sorted, the list reads 3, 5, 7, 9, 14, and the middle value is 7.",
          ],
          example: { q: "Median of 9, 3, 14, 7, 5", steps: ["Sort: 3, 5, 7, 9, 14.", "Five values, so the middle is the third."], a: "7" },
        },
        {
          heading: "Finding the middle position",
          paras: [
            "With an odd number of values there is exactly one middle: the (n + 1)/2-th. For five values that is the third; for seven, the fourth.",
            "A quicker way in practice is to cross off the smallest and largest together, over and over, until one value is left.",
          ],
          example: { q: "Median of 22, 8, 15, 30, 11, 19, 4", steps: ["Sort: 4, 8, 11, 15, 19, 22, 30.", "Seven values, so the middle is the fourth."], a: "15" },
        },
        {
          heading: "Sorting without errors",
          paras: [
            "Write the sorted list out rather than trying to order it in your head, and tick each number off the original as you place it.",
            "Then count that your sorted list has as many numbers as the original. A dropped value shifts the middle and changes the answer.",
          ],
        },
        {
          heading: "Why use it at all",
          paras: [
            "The median ignores how extreme the outer values are. In 1, 2, 3, 4, 1000 the mean is 202 — higher than four of the five values — while the median is 3.",
            "So when one value is wildly out of line, the median describes the middle of the data better than the mean does.",
          ],
        },
      ],
      mistakes: [
        "Taking the middle of the unsorted list.",
        "Dropping a value while sorting, which moves the middle.",
        "Giving the position of the middle value instead of the value itself.",
      ],
      recap: [
        "Sort the list first — this is the whole trick.",
        "With n values, the middle is the (n + 1)/2-th.",
        "Or cross off the smallest and largest in pairs until one remains.",
        "The median resists extreme values in a way the mean does not.",
      ],
      practice: [
        { q: "Median of 12, 5, 9, 3, 7", a: "7" },
        { q: "Median of 20, 14, 25, 18, 22", a: "20" },
        { q: "Median of 6, 11, 2, 9, 4, 13, 8", a: "8" },
        { q: "Median of 31, 17, 44, 26, 39", a: "31" },
        { q: "Median of 1, 50, 25, 10, 40, 5, 30", a: "25" },
      ],
    },
    {
      title: "The mode",
      intro: "“Mode of 4, 7, 4, 9, 4, 2?” The mode is the value that turns up most often. It is the quickest of the three averages to find, and the only one that needs no arithmetic at all.",
      sections: [
        {
          heading: "Count, do not calculate",
          paras: [
            "The mode is simply whichever value appears the most times. There is nothing to add and nothing to divide.",
            "In 4, 7, 4, 9, 4, 2 the value 4 appears three times and everything else appears once, so the mode is 4.",
          ],
          example: { q: "Mode of 4, 7, 4, 9, 4, 2", steps: ["Count each value: 4 appears three times, 7 once, 9 once, 2 once.", "The most frequent value is 4."], a: "4" },
        },
        {
          heading: "The answer is the value, not the count",
          paras: [
            "4 appears three times, but the mode is 4, not 3. The question asks which value is commonest, not how common it is.",
            "That is the error this topic produces almost exclusively, and it is worth pausing over before writing the answer down.",
          ],
        },
        {
          heading: "Counting reliably",
          paras: [
            "Go through the list once, ticking each value off as you meet it and keeping a tally beside each distinct number.",
            "At this level exactly one value repeats and everything else appears once, so the repeated one is usually visible at a glance — but a tally makes it certain.",
          ],
        },
        {
          heading: "How it differs from the others",
          paras: [
            "The mode is the only average that has to be one of the actual values in the list. A mean can be a number that never appears at all.",
            "It is also the only one that works on things that are not numbers — the most common colour, or the most popular answer.",
          ],
        },
      ],
      mistakes: [
        "Giving how many times the value appeared instead of the value.",
        "Picking the largest value rather than the most frequent one.",
        "Miscounting when the repeated value is spread across the list.",
      ],
      recap: [
        "The mode is the most frequently occurring value.",
        "No arithmetic — just counting.",
        "Answer with the value, not its frequency.",
        "It is always one of the values actually in the list.",
      ],
      practice: [
        { q: "Mode of 4, 7, 4, 9, 4, 2", a: "4" },
        { q: "Mode of 15, 8, 15, 3, 15, 11", a: "15" },
        { q: "Mode of 6, 6, 6, 1, 9, 12", a: "6" },
        { q: "Mode of 23, 5, 23, 17, 23, 8", a: "23" },
        { q: "Mode of 2, 19, 19, 19, 7, 14", a: "19" },
      ],
    },
  ],

  // ---- Ruby · Statistics II ------------------------------------------------
  stats2: [
    {
      title: "The range",
      intro: "“Range of 14, 3, 27, 8?” The range measures how spread out the data is, in the crudest possible way: the distance from the smallest value to the largest.",
      sections: [
        {
          heading: "Largest minus smallest",
          paras: [
            "Find the biggest value and the smallest value, and subtract. That is the whole calculation.",
            "For 14, 3, 27, 8: the largest is 27 and the smallest is 3, so the range is 24.",
          ],
          example: { q: "Range of 14, 3, 27, 8", steps: ["Largest: 27.", "Smallest: 3.", "27 − 3."], a: "24" },
        },
        {
          heading: "Spread, not centre",
          paras: [
            "Mean, median and mode all answer “what is typical?”. Range answers a different question: “how varied is it?”.",
            "Two sets can share a mean and have wildly different ranges. 9, 10, 11 and 1, 10, 19 both average 10, but their ranges are 2 and 18.",
          ],
        },
        {
          heading: "Scanning the list",
          paras: [
            "You do not need to sort. One pass through the list, keeping track of the biggest and smallest you have seen, is enough.",
            "With six values it is tempting to eyeball it, but a genuinely quick scan beats a confident guess — the smallest value is easy to miss near the end of a list.",
          ],
        },
        {
          heading: "Edge cases",
          paras: [
            "If every value is the same the range is 0, which is correct: there is no spread at all.",
            "The range is never negative. Subtracting the other way round means you have identified the largest and smallest the wrong way about.",
          ],
        },
      ],
      mistakes: [
        "Subtracting in the wrong order and giving a negative answer.",
        "Missing the true smallest or largest value in a long list.",
        "Giving the two extreme values instead of the difference between them.",
      ],
      recap: [
        "Range = largest − smallest.",
        "It measures spread, not centre.",
        "One scan of the list is enough; no sorting needed.",
        "Identical values give a range of 0, and it is never negative.",
      ],
      practice: [
        { q: "Range of 12, 45, 8, 33, 21, 5", a: "40" },
        { q: "Range of 60, 22, 71, 15, 48, 39", a: "56" },
        { q: "Range of 7, 7, 7, 7, 7, 7", a: "0" },
        { q: "Range of 91, 4, 56, 23, 88, 12", a: "87" },
        { q: "Range of 30, 65, 18, 42, 55, 27", a: "47" },
      ],
    },
    {
      title: "Population variance",
      intro: "“Population variance of 4, 4, 10, 10?” Variance measures spread like the range does, but it uses every value rather than only the two extremes.",
      sections: [
        {
          heading: "The four steps",
          paras: [
            "Find the mean. Take each value's distance from it. Square each of those distances. Average the squares.",
            "That average of squared distances is the variance. It is longer than the range but it notices every value in the set.",
          ],
        },
        {
          heading: "Worked through",
          paras: [
            "For 4, 4, 10, 10: the mean is 7. The distances from 7 are −3, −3, 3, 3. Squaring gives 9, 9, 9, 9.",
            "The average of those four nines is 9, so the variance is 9.",
          ],
          example: { q: "Population variance of 4, 4, 10, 10", steps: ["Mean: (4 + 4 + 10 + 10) ÷ 4 = 7.", "Distances from the mean: −3, −3, 3, 3.", "Squares: 9, 9, 9, 9.", "Average of the squares: 36 ÷ 4."], a: "9" },
        },
        {
          heading: "Why square?",
          paras: [
            "The distances always add to zero — the ones above the mean exactly cancel the ones below. Averaging them raw would give 0 every single time.",
            "Squaring removes the signs so nothing cancels, and it also weights a big deviation more heavily than a small one.",
          ],
        },
        {
          heading: "Population, not sample",
          paras: [
            "The word “population” means you divide by n, the number of values. Sample variance divides by n − 1 instead, and gives a slightly larger answer.",
            "The questions here always say population, so divide by n every time.",
          ],
          example: { q: "Population variance of 15, 15, 21, 21", steps: ["Mean: 18.", "Distances: −3, −3, 3, 3.", "Squares: 9 four times, totalling 36.", "36 ÷ 4."], a: "9" },
        },
      ],
      mistakes: [
        "Averaging the distances without squaring them, which always gives 0.",
        "Forgetting to divide at the end and giving the total of the squares.",
        "Dividing by n − 1, which is the sample formula rather than the population one.",
      ],
      recap: [
        "Mean, then distances, then squares, then average.",
        "Squaring stops the positive and negative distances cancelling.",
        "Population variance divides by n.",
        "The answer is never negative.",
      ],
      practice: [
        { q: "Population variance of 8, 8, 12, 12", a: "4" },
        { q: "Population variance of 15, 15, 21, 21", a: "9" },
        { q: "Population variance of 30, 30, 40, 40", a: "25" },
        { q: "Population variance of 6, 6, 20, 20", a: "49" },
        { q: "Population variance of 25, 25, 27, 27", a: "1" },
      ],
    },
    {
      title: "Population standard deviation",
      intro: "“Population standard deviation of 24, 26, 18, 32?” One extra step beyond variance — and that step is what makes the number readable.",
      sections: [
        {
          heading: "It is the square root of the variance",
          paras: [
            "Work out the variance exactly as before, then take its square root. That is the entire difference between the two levels.",
            "So the method is five steps: mean, distances, squares, average, root.",
          ],
          example: { q: "Population standard deviation of 24, 26, 18, 32", steps: ["Mean: (24 + 26 + 18 + 32) ÷ 4 = 25.", "Distances: −1, 1, −7, 7.", "Squares: 1, 1, 49, 49, totalling 100.", "Variance: 100 ÷ 4 = 25. Root: √25."], a: "5" },
        },
        {
          heading: "Why bother with the root",
          paras: [
            "Squaring the distances also squared the units. A variance computed from measurements in centimetres is in square centimetres, which is meaningless as a description of spread.",
            "Taking the root brings it back to the original units, so the standard deviation can be read as a typical distance from the mean.",
          ],
        },
        {
          heading: "The answers come out whole",
          paras: [
            "These questions are built so the variance is a perfect square — 25, 169 and so on — and the standard deviation is a whole number.",
            "So if your variance is not a perfect square, check the arithmetic before reaching for a decimal. A number like 26 at this level means a slip earlier.",
          ],
          example: { q: "Population standard deviation of 33, 47, 23, 57", steps: ["Mean: 160 ÷ 4 = 40.", "Distances: −7, 7, −17, 17.", "Squares: 49, 49, 289, 289, totalling 676.", "Variance: 676 ÷ 4 = 169. Root: √169."], a: "13" },
        },
        {
          heading: "A sense check",
          paras: [
            "The standard deviation should look like a typical distance from the mean — bigger than the smallest deviation, smaller than the largest.",
            "For 24, 26, 18, 32 the deviations are 1, 1, 7 and 7, and the answer of 5 sits sensibly between them. An answer of 25 or 0.5 would not.",
          ],
        },
      ],
      mistakes: [
        "Stopping at the variance and forgetting the square root.",
        "Taking the root of each squared distance instead of the root at the end.",
        "Dividing by n − 1 rather than n.",
      ],
      recap: [
        "Standard deviation = √variance.",
        "Mean, distances, squares, average, then root.",
        "The root restores the original units.",
        "It should read as a typical distance from the mean.",
      ],
      practice: [
        { q: "Population standard deviation of 29, 31, 23, 37", a: "5" },
        { q: "Population standard deviation of 33, 47, 23, 57", a: "13" },
        { q: "Population standard deviation of 15, 25, 15, 25", a: "5" },
        { q: "Population standard deviation of 49, 51, 43, 57", a: "5" },
        { q: "Population standard deviation of 18, 32, 8, 42", a: "13" },
      ],
    },
  ],

  // ---- Ruby · Statistics III -----------------------------------------------
  stats3: [
    {
      title: "Probability",
      intro: "“A bag has 4 red and 6 blue marbles. P(red)?” Probability counts the outcomes you want against all the outcomes there are, and the answer is a reduced fraction.",
      sections: [
        {
          heading: "Wanted over total",
          paras: [
            "P(event) = the number of outcomes that count as the event, divided by the total number of outcomes.",
            "For 4 red and 6 blue: 4 outcomes are red, and there are 10 marbles altogether, so P(red) = 4/10, which reduces to 2/5.",
          ],
          example: { q: "A bag has 4 red and 6 blue marbles. P(red)?", steps: ["Red marbles: 4.", "Total marbles: 4 + 6 = 10.", "4/10 reduces by 2."], a: "2/5" },
        },
        {
          heading: "The total is everything",
          paras: [
            "The denominator is every marble in the bag, not just the ones you are not asking about. With 4 red and 6 blue the total is 10, not 6.",
            "That is the mistake this level produces most: writing the two counts as a ratio, 4/6, rather than a probability, 4/10.",
          ],
        },
        {
          heading: "Reduce the fraction",
          paras: [
            "The answer is wanted in lowest terms, so 4/10 becomes 2/5 and 8/10 becomes 4/5. This is the Silver fractions skill, reused.",
            "6/12 becomes 1/2, and a probability of exactly a half is a perfectly ordinary answer.",
          ],
          example: { q: "A bag has 3 red and 9 blue marbles. P(red)?", steps: ["Red: 3. Total: 12.", "3/12 divides by 3."], a: "1/4" },
        },
        {
          heading: "Sense checks",
          paras: [
            "A probability is always between 0 and 1, so the numerator can never exceed the denominator. Anything bigger than 1 is a mistake.",
            "And the probabilities of red and blue must add to exactly 1, since one or the other must happen. That is a free check on any answer.",
          ],
        },
      ],
      mistakes: [
        "Using the count of the other colour as the denominator instead of the total.",
        "Leaving the fraction unreduced.",
        "Giving the raw counts as a ratio rather than as a probability.",
      ],
      recap: [
        "P = favourable outcomes ÷ total outcomes.",
        "The total means every outcome, including the favourable ones.",
        "Reduce the fraction.",
        "Probabilities lie between 0 and 1, and complementary ones add to 1.",
      ],
      practice: [
        { q: "A bag has 3 red and 9 blue marbles. P(red)?", a: "1/4" },
        { q: "A bag has 5 red and 7 blue marbles. P(blue)?", a: "7/12" },
        { q: "A bag has 8 red and 2 blue marbles. P(red)?", a: "4/5" },
        { q: "A bag has 6 red and 6 blue marbles. P(blue)?", a: "1/2" },
        { q: "A bag has 2 red and 5 blue marbles. P(red)?", a: "2/7" },
      ],
    },
    {
      title: "Combinations",
      intro: "“How many ways to choose 3 items from 7?” Choosing a group where the order does not matter — a committee, not a podium.",
      sections: [
        {
          heading: "Order does not matter",
          paras: [
            "Picking Ann, Ben and Cara is the same committee as picking Cara, Ann and Ben. All that matters is who is in the group.",
            "That is what makes this a combination rather than a permutation, and it is always the first thing to establish.",
          ],
        },
        {
          heading: "The formula",
          paras: [
            "C(n, k) = n! ÷ (k!(n − k)!). In practice you never need the full factorials: multiply k numbers counting down from n, then divide by k factorial.",
            "For C(7, 3): (7 × 6 × 5) ÷ (3 × 2 × 1) = 210 ÷ 6 = 35.",
          ],
          example: { q: "How many ways to choose 3 items from 7?", steps: ["Multiply 3 numbers down from 7: 7 × 6 × 5 = 210.", "Divide by 3! = 6.", "210 ÷ 6."], a: "35" },
        },
        {
          heading: "Why the division",
          paras: [
            "7 × 6 × 5 counts every ordered selection: Ann-Ben-Cara and Cara-Ben-Ann are counted separately. But there are 3! = 6 orderings of any three people.",
            "So dividing by 6 collapses each group's six orderings into one. The division is exactly what removes the order.",
          ],
        },
        {
          heading: "A useful symmetry",
          paras: [
            "C(n, k) always equals C(n, n − k): choosing 4 from 6 is the same as choosing which 2 to leave out. Both come to 15.",
            "So when k is more than half of n, swap to the smaller one and the arithmetic gets easier.",
          ],
          example: { q: "How many ways to choose 4 items from 6?", steps: ["Choosing 4 to keep is the same as choosing 2 to leave out.", "C(6, 2) = (6 × 5) ÷ 2 = 15."], a: "15" },
        },
      ],
      mistakes: [
        "Forgetting to divide, which gives the permutation count instead.",
        "Dividing by k rather than by k factorial.",
        "Multiplying too many or too few terms — there should be exactly k of them.",
      ],
      recap: [
        "Combinations are for groups where the order does not matter.",
        "Multiply k terms counting down from n, then divide by k!.",
        "The division is what removes the orderings.",
        "C(n, k) = C(n, n − k) — pick whichever is easier.",
      ],
      practice: [
        { q: "How many ways to choose 2 items from 6?", a: "15" },
        { q: "How many ways to choose 3 items from 5?", a: "10" },
        { q: "How many ways to choose 4 items from 6?", a: "15" },
        { q: "How many ways to choose 2 items from 9?", a: "36" },
        { q: "How many ways to choose 3 items from 8?", a: "56" },
      ],
    },
    {
      title: "Permutations",
      intro: "“How many ordered arrangements of 3 items from 7?” The same choosing, except now the order counts — gold, silver and bronze rather than a committee.",
      sections: [
        {
          heading: "Order matters here",
          paras: [
            "Ann first and Ben second is a different result from Ben first and Ann second. When the positions are distinguishable, every ordering counts separately.",
            "That makes a permutation count larger than the matching combination count — always by a factor of k!.",
          ],
        },
        {
          heading: "The formula",
          paras: [
            "P(n, k) = n × (n − 1) × (n − 2) × … , with exactly k factors. There is no dividing at all.",
            "For P(7, 3): 7 × 6 × 5 = 210. Each position has one fewer candidate than the last, because whoever was chosen is no longer available.",
          ],
          example: { q: "How many ordered arrangements of 3 items from 7?", steps: ["First position: 7 choices.", "Second: 6 left.", "Third: 5 left.", "7 × 6 × 5."], a: "210" },
        },
        {
          heading: "Count the factors",
          paras: [
            "The number of factors is k, not n. For 2 items from 8 you multiply two numbers, 8 × 7 = 56 — you do not count all the way down to 1.",
            "Writing the positions out as blanks and filling in the count for each is the reliable way to get this right.",
          ],
          example: { q: "How many ordered arrangements of 2 items from 8?", steps: ["Two positions to fill.", "First: 8 choices. Second: 7 left.", "8 × 7."], a: "56" },
        },
        {
          heading: "Telling the two apart",
          paras: [
            "Ask whether swapping two of your chosen items gives a different result. If it does, order matters and it is a permutation; if not, it is a combination.",
            "Race positions, passwords and seating orders are permutations. Committees, hands of cards and pizza toppings are combinations.",
          ],
        },
      ],
      mistakes: [
        "Dividing by k! out of habit, which turns it into a combination.",
        "Multiplying all the way down to 1 instead of using exactly k factors.",
        "Reading a committee question as a permutation, or a podium question as a combination.",
      ],
      recap: [
        "Permutations count arrangements where the order matters.",
        "Multiply k factors counting down from n; no division.",
        "P(n, k) is always k! times bigger than C(n, k).",
        "Ask whether swapping two picks changes the outcome.",
      ],
      practice: [
        { q: "How many ordered arrangements of 2 items from 5?", a: "20" },
        { q: "How many ordered arrangements of 3 items from 6?", a: "120" },
        { q: "How many ordered arrangements of 2 items from 8?", a: "56" },
        { q: "How many ordered arrangements of 3 items from 4?", a: "24" },
        { q: "How many ordered arrangements of 3 items from 9?", a: "504" },
      ],
    },
  ],

  // ---- Obsidian · Trigonometry ---------------------------------------------
  trig: [
    {
      title: "The exact values",
      intro: "“sin(60°) = ?” Five angles, three functions, and a small table of exact answers. Everything above this level assumes you know it cold, so it is worth learning properly rather than looking up.",
      sections: [
        {
          heading: "What the three functions are",
          paras: [
            "In a right triangle, pick one of the non-right angles and call it θ. The side across from it is the opposite, the one touching it is the adjacent, and the long one is the hypotenuse.",
            "Then sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, and tan θ = opposite/adjacent. The old mnemonic SOH-CAH-TOA is exactly those three.",
          ],
        },
        {
          heading: "The table",
          paras: [
            "sin: 0 at 0°, 1/2 at 30°, √2/2 at 45°, √3/2 at 60°, 1 at 90°.",
            "cos is the same list backwards: 1 at 0°, √3/2 at 30°, √2/2 at 45°, 1/2 at 60°, 0 at 90°.",
            "tan: 0 at 0°, √3/3 at 30°, 1 at 45°, √3 at 60°. At 90° it is undefined, which is why it never appears in these questions.",
          ],
          example: { q: "sin(60°)", steps: ["60° is the fourth entry in the sine list.", "The list runs 0, 1/2, √2/2, √3/2, 1."], a: "sqrt3/2" },
        },
        {
          heading: "A way to remember it",
          paras: [
            "Write the angles 0, 30, 45, 60, 90 in a row. Underneath write 0, 1, 2, 3, 4. Now take the square root of each and divide by 2: √0/2, √1/2, √2/2, √3/2, √4/2.",
            "That simplifies to 0, 1/2, √2/2, √3/2, 1 — the sine row exactly. Read it right-to-left and you have the cosine row. It is one pattern rather than ten facts.",
          ],
        },
        {
          heading: "Tangent comes from the other two",
          paras: [
            "tan θ = sin θ / cos θ, so you never have to memorise the tangent row separately.",
            "tan 60° = (√3/2) ÷ (1/2) = √3. tan 30° = (1/2) ÷ (√3/2) = 1/√3, which is written √3/3 once the root is cleared from the bottom.",
          ],
          example: { q: "tan(45°)", steps: ["tan = sin ÷ cos.", "At 45° both are √2/2.", "Anything divided by itself is 1."], a: "1" },
        },
      ],
      mistakes: [
        "Swapping the sine and cosine rows — they are mirror images, so it is easy to read the wrong end.",
        "Giving a decimal when the question asks for an exact value: write sqrt3/2, not 0.866.",
        "Writing tan 30° as 1/sqrt3 when the expected form is sqrt3/3 — both are accepted here, but the rationalised form is standard.",
      ],
      recap: [
        "SOH-CAH-TOA: sine is opposite over hypotenuse, and so on.",
        "sin runs 0, 1/2, √2/2, √3/2, 1 across 0° to 90°; cos is the reverse.",
        "The √0 to √4 over 2 pattern generates the whole table.",
        "tan = sin ÷ cos, so it needs no separate memorising.",
      ],
      practice: [
        { q: "sin(30°)", a: "1/2" },
        { q: "cos(60°)", a: "1/2" },
        { q: "sin(45°)", a: "sqrt2/2" },
        { q: "tan(60°)", a: "sqrt3" },
        { q: "cos(30°)", a: "sqrt3/2" },
      ],
    },
    {
      title: "Ratios from side lengths",
      intro: "A right triangle's three sides are given and you are asked for sin θ, cos θ or tan θ as a fraction. No table needed — just pick the right two sides and reduce.",
      sections: [
        {
          heading: "Identify the three sides first",
          paras: [
            "The hypotenuse is always the longest side, opposite the right angle. Of the other two, the opposite is the one across from θ and the adjacent is the one touching it.",
            "The questions state all three explicitly, so the work is choosing correctly rather than working anything out.",
          ],
        },
        {
          heading: "Pick the pair the function names",
          paras: [
            "sin wants opposite over hypotenuse. cos wants adjacent over hypotenuse. tan wants opposite over adjacent — the only one that does not involve the hypotenuse.",
            "With opposite 8, adjacent 15 and hypotenuse 17: cos θ is 15/17.",
          ],
          example: { q: "opposite 8, adjacent 15, hypotenuse 17. cos θ?", steps: ["Cosine is adjacent over hypotenuse.", "Adjacent is 15, hypotenuse is 17."], a: "15/17" },
        },
        {
          heading: "Reduce the fraction",
          paras: [
            "The sides are often a scaled triple, so the fraction may cancel. With opposite 6, adjacent 8 and hypotenuse 10, cos θ = 8/10, which reduces to 4/5.",
            "The scaling factor cancels out entirely — which is the deep fact behind trigonometry. Every triangle with the same angles gives the same ratios, whatever its size.",
          ],
          example: { q: "opposite 6, adjacent 8, hypotenuse 10. cos θ?", steps: ["Cosine is adjacent over hypotenuse: 8/10.", "Both divide by 2."], a: "4/5" },
        },
        {
          heading: "Checking your answer",
          paras: [
            "Sine and cosine are always fractions of the hypotenuse, which is the longest side, so both must come out less than 1. If yours is bigger than 1, you have put the hypotenuse on top.",
            "Tangent has no such limit — it can be anything, because neither of its sides is the hypotenuse.",
          ],
        },
      ],
      mistakes: [
        "Putting the hypotenuse on top, giving a sine or cosine greater than 1.",
        "Using the hypotenuse in tan, which needs only the two legs.",
        "Leaving the fraction unreduced.",
      ],
      recap: [
        "sin = opp/hyp, cos = adj/hyp, tan = opp/adj.",
        "Identify all three sides before choosing.",
        "Reduce the fraction — the scaling cancels.",
        "Sine and cosine are always under 1; tangent need not be.",
      ],
      practice: [
        { q: "opposite 5, adjacent 12, hypotenuse 13. sin θ?", a: "5/13" },
        { q: "opposite 5, adjacent 12, hypotenuse 13. cos θ?", a: "12/13" },
        { q: "opposite 8, adjacent 15, hypotenuse 17. tan θ?", a: "8/15" },
        { q: "opposite 7, adjacent 24, hypotenuse 25. sin θ?", a: "7/25" },
        { q: "opposite 6, adjacent 8, hypotenuse 10. cos θ?", a: "4/5" },
      ],
    },
    {
      title: "Finding the angle",
      intro: "“sin θ = 1/2 and 0° < θ < 90°. θ in degrees?” The ratio is given and the angle is missing — the level 1 table, read the other way round.",
      sections: [
        {
          heading: "Read the table backwards",
          paras: [
            "You know sin 30° = 1/2. So if a question says sin θ = 1/2, the answer is 30°.",
            "There is nothing more to it than recognising the value. This is why level 1 is worth memorising rather than deriving each time.",
          ],
          example: { q: "sin θ = 1/2 and 0° < θ < 90°. θ?", steps: ["Which angle has a sine of 1/2?", "From the table, 30°."], a: "30" },
        },
        {
          heading: "The three tables to scan",
          paras: [
            "sin: 1/2 → 30°, √2/2 → 45°, √3/2 → 60°.",
            "cos: √3/2 → 30°, √2/2 → 45°, 1/2 → 60°. Note this is the reverse of sine, so 1/2 means 30° for sine but 60° for cosine.",
            "tan: √3/3 → 30°, 1 → 45°, √3 → 60°.",
          ],
          example: { q: "cos θ = √2/2 and 0° < θ < 90°. θ?", steps: ["Which angle has a cosine of √2/2?", "Sine and cosine agree only at 45°."], a: "45" },
        },
        {
          heading: "Sine and cosine give different answers",
          paras: [
            "The single most common error is answering a cosine question from the sine row. sin θ = 1/2 gives 30°, but cos θ = 1/2 gives 60°.",
            "Check which function the question named before you answer. The two rows are mirror images, so a misread swaps 30° and 60° exactly.",
          ],
        },
        {
          heading: "Why the range is stated",
          paras: [
            "sin θ = 1/2 is also true at 150°, and at 390°, and infinitely often after that. The condition 0° < θ < 90° cuts all of those away and leaves exactly one answer.",
            "So the restriction is not decoration — it is what makes the question have a single answer.",
          ],
        },
      ],
      mistakes: [
        "Answering a cosine question from the sine row, swapping 30° and 60°.",
        "Giving the ratio back instead of the angle.",
        "Answering in radians, or with a decimal, when degrees were asked for.",
      ],
      recap: [
        "This is the level 1 table read from the value to the angle.",
        "sin 1/2 → 30°, but cos 1/2 → 60°.",
        "√2/2 gives 45° for both sine and cosine.",
        "The stated range is what makes the answer unique.",
      ],
      practice: [
        { q: "sin θ = 1/2 and 0° < θ < 90°. θ?", a: "30" },
        { q: "cos θ = √2/2 and 0° < θ < 90°. θ?", a: "45" },
        { q: "tan θ = 1 and 0° < θ < 90°. θ?", a: "45" },
        { q: "sin θ = √3/2 and 0° < θ < 90°. θ?", a: "60" },
        { q: "tan θ = √3/3 and 0° < θ < 90°. θ?", a: "30" },
      ],
    },
  ],

  // ---- Obsidian · Law of Cosines -------------------------------------------
  lawCos: [
    {
      title: "Finding the third side",
      intro: "Two sides of a triangle and the angle between them, and you want the side opposite that angle. Pythagoras only works at 90°; the Law of Cosines works at any angle.",
      sections: [
        {
          heading: "Pythagoras with a correction",
          paras: [
            "The rule is c² = a² + b² − 2ab·cos C, where C is the angle between sides a and b, and c is the side opposite it.",
            "When C is 90°, cos C is 0 and the whole last term vanishes — leaving c² = a² + b². So Pythagoras is just this rule at one particular angle.",
          ],
        },
        {
          heading: "The two angles you will meet",
          paras: [
            "These questions use 60° and 120°, and both have clean cosines. cos 60° = 1/2, so the correction term becomes −ab. cos 120° = −1/2, so it becomes +ab.",
            "That gives two shortcut formulas worth memorising: at 60°, c² = a² + b² − ab. At 120°, c² = a² + b² + ab.",
          ],
          example: { q: "XY = 3, YZ = 8, angle XYZ = 60°. XZ?", steps: ["At 60°: c² = a² + b² − ab.", "9 + 64 − 24 = 49.", "√49."], a: "7" },
        },
        {
          heading: "Bigger at 120°, smaller at 60°",
          paras: [
            "Opening the angle past 90° pushes the far corners apart, so the third side is longer than Pythagoras would give. Closing it below 90° pulls them together.",
            "That is a useful check. At 120° with sides 3 and 5, Pythagoras would give √34 ≈ 5.8, and the true answer of 7 is properly larger.",
          ],
          example: { q: "XY = 3, YZ = 5, angle XYZ = 120°. XZ?", steps: ["At 120°: c² = a² + b² + ab.", "9 + 25 + 15 = 49.", "√49."], a: "7" },
        },
        {
          heading: "The angle must be the included one",
          paras: [
            "C has to be the angle between the two sides you squared. In triangle XYZ, angle XYZ sits at Y — between XY and YZ — and the side opposite it is XZ.",
            "Using a different angle gives a wrong answer with no warning, so name the two sides and check the angle sits between them before you start.",
          ],
        },
      ],
      mistakes: [
        "Using +ab at 60° and −ab at 120° — the signs are the other way round, because cos 120° is negative.",
        "Applying the formula with an angle that is not between the two given sides.",
        "Forgetting the final square root and giving c² as the answer.",
      ],
      recap: [
        "c² = a² + b² − 2ab·cos C, with C between a and b.",
        "At 60°: c² = a² + b² − ab. At 120°: c² = a² + b² + ab.",
        "At 90° the correction disappears and it becomes Pythagoras.",
        "A 120° angle always gives a longer third side than 60° would.",
      ],
      practice: [
        { q: "XY = 5, YZ = 8, angle XYZ = 60°. XZ?", a: "7" },
        { q: "XY = 7, YZ = 15, angle XYZ = 60°. XZ?", a: "13" },
        { q: "XY = 7, YZ = 8, angle XYZ = 120°. XZ?", a: "13" },
        { q: "XY = 5, YZ = 16, angle XYZ = 120°. XZ?", a: "19" },
        { q: "XY = 9, YZ = 15, angle XYZ = 120°. XZ?", a: "21" },
      ],
    },
    {
      title: "Answers in surd form",
      intro: "The same calculation, but the sides are no longer chosen to give a whole answer. c² comes out as something like 39, and the answer is written √39 or a simplified surd.",
      sections: [
        {
          heading: "Nothing changes until the last step",
          paras: [
            "Use the same shortcuts: a² + b² − ab at 60°, a² + b² at 90°, a² + b² + ab at 120°. Work out c² exactly as before.",
            "It is only the square root at the end that behaves differently, because c² is usually not a perfect square.",
          ],
          example: { q: "XY = 2, YZ = 3, angle XYZ = 60°. XZ?", steps: ["At 60°: 4 + 9 − 6 = 7.", "7 is not a perfect square, so the answer stays as a root."], a: "sqrt7" },
        },
        {
          heading: "Simplifying a surd",
          paras: [
            "Look for a perfect square hiding inside. √27 is √(9 × 3) = 3√3, because the 9 comes out of the root as a 3.",
            "Check for factors of 4, 9, 16 and 25 in turn. If none divide it, the root is already as simple as it gets and √39 is the final answer.",
          ],
          example: { q: "XY = 3, YZ = 3, angle XYZ = 120°. XZ?", steps: ["At 120°: 9 + 9 + 9 = 27.", "27 = 9 × 3, and √9 = 3.", "So the answer is 3√3."], a: "3sqrt3" },
        },
        {
          heading: "Do not reach for a decimal",
          paras: [
            "√39 is the exact answer; 6.245 is a rounded approximation that is never quite right. These questions want the exact form.",
            "Write it as sqrt39, or 3sqrt3 for the simplified case — the same notation the rest of the game uses.",
          ],
        },
        {
          heading: "A sanity check on the size",
          paras: [
            "The third side must be shorter than the two others added together, and longer than their difference. For sides 2 and 5 that means between 3 and 7.",
            "√39 is about 6.2, which fits. If your surd lands outside that window, the sign of the correction term is the first thing to check.",
          ],
        },
      ],
      mistakes: [
        "Rounding to a decimal when the exact surd was asked for.",
        "Missing a square factor, leaving √27 rather than 3√3.",
        "Taking the square root of each term separately instead of the whole total.",
      ],
      recap: [
        "Same formula and the same 60°/90°/120° shortcuts.",
        "c² is usually not a perfect square, so the answer is a surd.",
        "Pull out any factor of 4, 9, 16 or 25 to simplify.",
        "Keep it exact — no decimals.",
      ],
      practice: [
        { q: "XY = 2, YZ = 3, angle XYZ = 60°. XZ?", a: "sqrt7" },
        { q: "XY = 3, YZ = 4, angle XYZ = 60°. XZ?", a: "sqrt13" },
        { q: "XY = 2, YZ = 5, angle XYZ = 120°. XZ?", a: "sqrt39" },
        { q: "XY = 3, YZ = 3, angle XYZ = 120°. XZ?", a: "3sqrt3" },
        { q: "XY = 4, YZ = 5, angle XYZ = 90°. XZ?", a: "sqrt41" },
      ],
    },
    {
      title: "Finding the angle from three sides",
      intro: "All three sides are given and the angle is missing. Rearrange the same formula and the cosine drops out — and at this level it is always ±1/2 or 0.",
      sections: [
        {
          heading: "Rearranging",
          paras: [
            "Start from c² = a² + b² − 2ab·cos C. Move things about and you get cos C = (a² + b² − c²)/(2ab).",
            "So square all three sides, combine them as the formula says, and divide. What comes out is the cosine, not the angle.",
          ],
        },
        {
          heading: "Which side is which",
          paras: [
            "c must be the side opposite the angle you are looking for. In triangle XYZ, angle XYZ is at Y, so a and b are XY and YZ, and c is XZ.",
            "Getting this wrong finds a different angle of the same triangle, which is a perfectly valid number and completely the wrong answer.",
          ],
          example: { q: "XY = 3, YZ = 8, XZ = 7. Angle XYZ?", steps: ["a = 3, b = 8, and c = 7 is opposite the angle.", "cos C = (9 + 64 − 49)/(2 × 3 × 8) = 24/48.", "That is 1/2, and cos 60° = 1/2."], a: "60" },
        },
        {
          heading: "Reading the cosine back",
          paras: [
            "Only three values appear here. 1/2 means 60°, 0 means 90°, and −1/2 means 120°.",
            "A negative cosine always means an obtuse angle — that is worth knowing generally, not just for these three cases.",
          ],
          example: { q: "XY = 3, YZ = 5, XZ = 7. Angle XYZ?", steps: ["cos C = (9 + 25 − 49)/(2 × 3 × 5) = −15/30.", "That is −1/2.", "A negative cosine means obtuse: 120°."], a: "120" },
        },
        {
          heading: "A shortcut when the answer is 90°",
          paras: [
            "cos C is zero exactly when a² + b² = c², which is Pythagoras. So if the three sides form a right triangle, the angle is 90° and no arithmetic is needed.",
            "Spotting 3-4-5, 5-12-13 or 8-15-17 among the sides answers the question instantly.",
          ],
        },
      ],
      mistakes: [
        "Using the wrong side as c, and finding a different angle of the triangle.",
        "Giving the cosine as the answer instead of the angle.",
        "Losing the minus sign and answering 60° when the cosine was −1/2.",
      ],
      recap: [
        "cos C = (a² + b² − c²)/(2ab).",
        "c is the side opposite the angle you want.",
        "1/2 → 60°, 0 → 90°, −1/2 → 120°.",
        "A negative cosine means an obtuse angle.",
      ],
      practice: [
        { q: "XY = 5, YZ = 8, XZ = 7. Angle XYZ?", a: "60" },
        { q: "XY = 7, YZ = 15, XZ = 13. Angle XYZ?", a: "60" },
        { q: "XY = 7, YZ = 8, XZ = 13. Angle XYZ?", a: "120" },
        { q: "XY = 3, YZ = 4, XZ = 5. Angle XYZ?", a: "90" },
        { q: "XY = 5, YZ = 12, XZ = 13. Angle XYZ?", a: "90" },
      ],
    },
  ],

  // ---- Obsidian · Law of Sines ---------------------------------------------
  lawSines: [
    {
      title: "Finding an angle",
      intro: "Two sides and the angle opposite one of them, and you want the angle opposite the other. The Law of Sines pairs each side with the angle across from it.",
      sections: [
        {
          heading: "The rule",
          paras: [
            "In any triangle, a/sin A = b/sin B = c/sin C. Each side divided by the sine of its opposite angle gives the same number.",
            "So you only ever need two of the three fractions: set the pair you know equal to the pair you want, and solve.",
          ],
        },
        {
          heading: "Pair each side with its opposite angle",
          paras: [
            "This is the step that goes wrong. A side must be paired with the angle across the triangle from it, never with one of the angles touching it.",
            "The questions say so explicitly — “side YZ (opposite X)” — so the pairing is handed to you. Use it exactly as written.",
          ],
          example: { q: "Angle X = 30°, YZ = 5 (opposite X), XZ = 10 (opposite Y). Angle Y?", steps: ["Set up: 5/sin 30° = 10/sin Y.", "sin 30° = 1/2, so the left side is 5 ÷ 0.5 = 10.", "So 10 = 10/sin Y, giving sin Y = 1.", "sin Y = 1 means Y = 90°."], a: "90" },
        },
        {
          heading: "Reading the sine back",
          paras: [
            "The algebra gives you sin Y, and you still have to turn that into an angle using the table from Trigonometry.",
            "sin Y = 1 gives 90°, sin Y = 1/2 gives 30°, sin Y = √2/2 gives 45°, sin Y = √3/2 gives 60°. Stopping at the sine is the second most common error here.",
          ],
          example: { q: "Angle X = 30°, YZ = 7 (opposite X), XZ = 7 (opposite Y). Angle Y?", steps: ["7/sin 30° = 7/sin Y.", "The two sides are equal, so the two sines must be equal.", "sin Y = sin 30°."], a: "30" },
        },
        {
          heading: "Equal sides, equal angles",
          paras: [
            "When the two given sides are the same length, the two angles opposite them are the same too — the fraction forces it.",
            "That is worth spotting straight away: it turns the whole question into a one-line answer with no arithmetic.",
          ],
        },
      ],
      mistakes: [
        "Pairing a side with an angle that touches it rather than the one opposite.",
        "Giving sin Y as the answer instead of Y.",
        "Inverting one fraction but not the other when rearranging.",
      ],
      recap: [
        "a/sin A = b/sin B = c/sin C.",
        "Every side pairs with the angle opposite it.",
        "Solve for the sine, then convert it to an angle.",
        "Equal sides mean equal opposite angles.",
      ],
      practice: [
        { q: "Angle X = 30°, YZ = 4 (opposite X), XZ = 8 (opposite Y). Angle Y?", a: "90" },
        { q: "Angle X = 30°, YZ = 7 (opposite X), XZ = 7 (opposite Y). Angle Y?", a: "30" },
        { q: "Angle X = 90°, YZ = 12 (opposite X), XZ = 6 (opposite Y). Angle Y?", a: "30" },
        { q: "Angle X = 45°, YZ = 9 (opposite X), XZ = 9 (opposite Y). Angle Y?", a: "45" },
        { q: "Angle X = 30°, YZ = 3 (opposite X), XZ = 6 (opposite Y). Angle Y?", a: "90" },
      ],
    },
    {
      title: "Finding a side",
      intro: "Two angles and the side opposite one of them, and you want the side opposite the other. The same rule, rearranged to leave a side on top — and the answers come out as exact surds.",
      sections: [
        {
          heading: "Rearranging for a side",
          paras: [
            "From a/sin A = b/sin B, multiply across to get b = a · sin B / sin A. The known side is multiplied by the ratio of the two sines.",
            "So the answer is the side you were given, scaled by sin(wanted angle) ÷ sin(known angle).",
          ],
          example: { q: "Angle X = 30°, angle Y = 90°, YZ = 4 (opposite X). XZ?", steps: ["XZ = YZ × sin Y / sin X = 4 × sin 90° / sin 30°.", "sin 90° = 1 and sin 30° = 1/2, so the ratio is 2.", "4 × 2."], a: "8" },
        },
        {
          heading: "The ratios that appear",
          paras: [
            "Because the angles are always from the special set, the sine ratio is always clean: 2, √2 or √3.",
            "sin 90°/sin 30° = 2. sin 60°/sin 30° = √3. sin 45°/sin 30° = √2. sin 90°/sin 45° = √2. sin 120°/sin 30° = √3, because sin 120° equals sin 60°.",
          ],
        },
        {
          heading: "Keeping the answer exact",
          paras: [
            "Multiplying 3 by √3 gives 3√3, and that is the finished answer — do not turn it into 5.196.",
            "Write it as 3sqrt3. If the ratio is a whole number the answer is whole too, as in the 4 × 2 = 8 above.",
          ],
          example: { q: "Angle X = 30°, angle Y = 60°, YZ = 3 (opposite X). XZ?", steps: ["Ratio: sin 60° / sin 30° = (√3/2) ÷ (1/2) = √3.", "XZ = 3 × √3."], a: "3sqrt3" },
        },
        {
          heading: "Which way up",
          paras: [
            "The bigger angle is always opposite the bigger side. If your answer is smaller than the side you were given but the wanted angle was larger, you have the ratio upside down.",
            "That check catches the one structural error at this level, and it costs a glance.",
          ],
        },
      ],
      mistakes: [
        "Inverting the sine ratio, so the answer comes out too small.",
        "Turning the surd into a decimal.",
        "Using sin 120° as something other than √3/2 — it is the same as sin 60°.",
      ],
      recap: [
        "b = a · sin B / sin A.",
        "The ratio of sines is always 2, √2 or √3 here.",
        "Multiply the known side by that ratio and keep it exact.",
        "The larger angle faces the larger side — use it as a check.",
      ],
      practice: [
        { q: "Angle X = 30°, angle Y = 90°, YZ = 4 (opposite X). XZ?", a: "8" },
        { q: "Angle X = 30°, angle Y = 60°, YZ = 3 (opposite X). XZ?", a: "3sqrt3" },
        { q: "Angle X = 30°, angle Y = 45°, YZ = 6 (opposite X). XZ?", a: "6sqrt2" },
        { q: "Angle X = 45°, angle Y = 90°, YZ = 5 (opposite X). XZ?", a: "5sqrt2" },
        { q: "Angle X = 30°, angle Y = 120°, YZ = 2 (opposite X). XZ?", a: "2sqrt3" },
      ],
    },
    {
      title: "Finding the third side",
      intro: "Two angles and one side again, but now the side you want is opposite the angle you were not given. One extra step comes first: work out that third angle.",
      sections: [
        {
          heading: "The angles add to 180°",
          paras: [
            "Every triangle's three angles total 180°, so the missing one is 180° minus the other two.",
            "With X = 30° and Y = 90°, angle Z is 60°. That is the angle facing the side you want, so nothing can happen until you have it.",
          ],
        },
        {
          heading: "Then it is level 2 again",
          paras: [
            "Once Z is known, use the same rearrangement: XY = YZ · sin Z / sin X. The side you want is the given side scaled by the ratio of sines.",
            "For X = 30°, Z = 60° and YZ = 5: the ratio is sin 60°/sin 30° = √3, so XY = 5√3.",
          ],
          example: { q: "Angle X = 30°, angle Y = 90°, YZ = 5 (opposite X). XY (opposite Z)?", steps: ["Third angle: Z = 180 − 30 − 90 = 60°.", "Ratio: sin 60° / sin 30° = √3.", "XY = 5 × √3."], a: "5sqrt3" },
        },
        {
          heading: "When the ratio is 1",
          paras: [
            "If the third angle equals the angle you were given, the sines are equal and the ratio is 1 — the two sides are the same length.",
            "With X = 45° and Y = 90°, Z is also 45°, so XY equals YZ exactly. Spot that and the question is already answered.",
          ],
          example: { q: "Angle X = 45°, angle Y = 90°, YZ = 7 (opposite X). XY (opposite Z)?", steps: ["Z = 180 − 45 − 90 = 45°.", "Z equals X, so the sines match and the ratio is 1.", "XY = YZ."], a: "7" },
        },
        {
          heading: "Do not skip the first step",
          paras: [
            "The commonest failure here is using angle Y — the one you were given — in place of Z, because it is the number sitting in front of you.",
            "Write Z down before touching the Law of Sines. It is one subtraction and it is the whole difference between this level and the last.",
          ],
        },
      ],
      mistakes: [
        "Using the given second angle instead of the computed third one.",
        "Subtracting from 360° instead of 180°.",
        "Doing the angle arithmetic correctly and then inverting the sine ratio.",
      ],
      recap: [
        "Find the third angle first: 180° minus the other two.",
        "Then XY = YZ · sin Z / sin X, exactly as at level 2.",
        "Equal angles mean equal opposite sides, and a ratio of 1.",
        "Write the third angle down before anything else.",
      ],
      practice: [
        { q: "Angle X = 30°, angle Y = 90°, YZ = 5 (opposite X). XY (opposite Z)?", a: "5sqrt3" },
        { q: "Angle X = 45°, angle Y = 90°, YZ = 7 (opposite X). XY (opposite Z)?", a: "7" },
        { q: "Angle X = 30°, angle Y = 30°, YZ = 2 (opposite X). XY (opposite Z)?", a: "2sqrt3" },
        { q: "Angle X = 60°, angle Y = 60°, YZ = 9 (opposite X). XY (opposite Z)?", a: "9" },
        { q: "Angle X = 45°, angle Y = 45°, YZ = 3 (opposite X). XY (opposite Z)?", a: "3sqrt2" },
      ],
    },
  ],

  // ---- Obsidian · Sinusoidal Waves -----------------------------------------
  sinusoid: [
    {
      title: "Amplitude",
      intro: "“Amplitude of y = −4sin(3x) + 2?” Three numbers sit in a sine equation and each controls something different. Amplitude is the first of them, and the easiest to read.",
      sections: [
        {
          heading: "The three numbers",
          paras: [
            "In y = A·sin(Bx) + C, the A sets how tall the wave is, the B sets how fast it repeats, and the C sets the level it waves about.",
            "Amplitude is the A — the distance from the middle of the wave up to a peak.",
          ],
        },
        {
          heading: "Take the size, not the sign",
          paras: [
            "Amplitude is |A|, the size of A with any minus discarded. For y = −4sin(3x) + 2 the amplitude is 4, not −4.",
            "A negative A does mean something — it flips the wave upside down, so it dips first instead of rising — but it does not make the wave shorter, and a height cannot be negative.",
          ],
          example: { q: "Amplitude of y = −4sin(3x) + 2", steps: ["A is the number in front of sin, which is −4.", "Amplitude is its size, ignoring the sign."], a: "4" },
        },
        {
          heading: "The other two do not matter here",
          paras: [
            "The 3 inside the bracket changes how often the wave repeats, and the +2 slides the whole thing up. Neither affects how tall it is.",
            "So for amplitude you can ignore everything except the number immediately in front of sin or cos.",
          ],
          example: { q: "Amplitude of y = 5sin(2x) + 1", steps: ["The number in front of sin is 5.", "The 2 and the 1 do not affect the height."], a: "5" },
        },
        {
          heading: "sin or cos makes no difference",
          paras: [
            "Cosine is the same wave as sine, just started a quarter of a cycle earlier. Its amplitude rule is identical.",
            "So y = −3cos(x) − 4 has amplitude 3, read exactly as you would for a sine.",
          ],
        },
      ],
      mistakes: [
        "Giving a negative amplitude when A is negative.",
        "Reading the number inside the bracket instead of the one in front.",
        "Including the vertical shift, so y = 5sin(2x) + 1 is answered as 6.",
      ],
      recap: [
        "y = A·sin(Bx) + C.",
        "Amplitude is |A| — always positive.",
        "A negative A flips the wave but not its height.",
        "B and C have no effect on amplitude, and cosine behaves like sine.",
      ],
      practice: [
        { q: "Amplitude of y = 5sin(2x) + 1", a: "5" },
        { q: "Amplitude of y = −3cos(x) − 4", a: "3" },
        { q: "Amplitude of y = 7cos(4x) + 2", a: "7" },
        { q: "Amplitude of y = −9sin(x) + 5", a: "9" },
        { q: "Amplitude of y = 2sin(3x) − 6", a: "2" },
      ],
    },
    {
      title: "Period",
      intro: "“Period of y = 4cos(3x)?” The period is how far along x the wave travels before it repeats itself. It depends only on the number multiplying x, and the answer is in terms of π.",
      sections: [
        {
          heading: "The base wave",
          paras: [
            "A plain sin(x) or cos(x) completes one full cycle in 2π and then repeats forever. So the period of y = sin(x) is 2π.",
            "Everything else is that number adjusted by whatever is multiplying the x.",
          ],
        },
        {
          heading: "The formula",
          paras: [
            "Period = 2π/B, where B is the coefficient of x inside the bracket.",
            "For y = 4cos(3x), B is 3, so the period is 2π/3. The 4 out front is the amplitude and has no effect at all.",
          ],
          example: { q: "Period of y = 4cos(3x)?", steps: ["B is the number multiplying x inside the bracket: 3.", "Period = 2π/B."], a: "2pi/3" },
        },
        {
          heading: "Bigger B means a faster wave",
          paras: [
            "Multiplying x by 3 makes the wave go through its cycle three times as fast, so each cycle is a third as long. That is why B is on the bottom.",
            "It catches people out because it feels backwards: a bigger number gives a smaller period.",
          ],
          example: { q: "Period of y = 5sin(4x)?", steps: ["B = 4.", "Period = 2π/4, which reduces."], a: "pi/2" },
        },
        {
          heading: "Fractional B",
          paras: [
            "sin(x/2) has B = 1/2, and dividing by a half doubles: the period is 4π. The wave is stretched out rather than squashed.",
            "Similarly sin(x/4) has period 8π. Whenever x is divided, expect a period longer than 2π.",
          ],
        },
      ],
      mistakes: [
        "Using the amplitude as B — the coefficient must be the one inside the bracket.",
        "Multiplying by B instead of dividing, so a fast wave gets a long period.",
        "Giving a decimal instead of a multiple of π.",
      ],
      recap: [
        "Period = 2π/B, where B multiplies x.",
        "Plain sin(x) and cos(x) have period 2π.",
        "A larger B squashes the wave and shortens the period.",
        "Dividing x stretches it: sin(x/2) has period 4π.",
      ],
      practice: [
        { q: "Period of y = 2sin(x)?", a: "2pi" },
        { q: "Period of y = 4cos(3x)?", a: "2pi/3" },
        { q: "Period of y = 5sin(4x)?", a: "pi/2" },
        { q: "Period of y = 3cos(x/2)?", a: "4pi" },
        { q: "Period of y = 2sin(x/4)?", a: "8pi" },
      ],
    },
    {
      title: "Maximum and minimum values",
      intro: "“Maximum value of y = 3sin(x) + 5?” The wave rises and falls a fixed distance either side of its middle, so the highest and lowest points come straight from the amplitude and the shift.",
      sections: [
        {
          heading: "Where the middle is",
          paras: [
            "The C in y = A·sin(Bx) + C is the line the wave oscillates about. Without it the wave is centred on zero; with it, the whole thing slides up or down by C.",
            "For y = 3sin(x) + 5 the middle sits at 5.",
          ],
        },
        {
          heading: "Up and down by the amplitude",
          paras: [
            "sin and cos never go above 1 or below −1, so A·sin(x) never goes above |A| or below −|A|.",
            "That gives maximum = C + |A| and minimum = C − |A|. For y = 3sin(x) + 5: the maximum is 8 and the minimum is 2.",
          ],
          example: { q: "Maximum value of y = 3sin(x) + 5", steps: ["Middle: C = 5.", "Amplitude: |3| = 3.", "Maximum = 5 + 3."], a: "8" },
        },
        {
          heading: "Use the size of A, not its sign",
          paras: [
            "A negative A flips the wave, but it still reaches the same distance above and below the middle. So the maximum is still C + |A|.",
            "For y = −4sin(x) + 7 the maximum is 7 + 4 = 11. Using −4 directly would give 3, which is actually the minimum.",
          ],
          example: { q: "Maximum value of y = −4sin(x) + 7", steps: ["Middle: 7. Amplitude: |−4| = 4.", "Maximum = 7 + 4."], a: "11" },
        },
        {
          heading: "Minimum works the same way",
          paras: [
            "Subtract instead of adding: minimum = C − |A|. For y = 6cos(x) − 2 that is −2 − 6 = −8.",
            "A negative minimum is perfectly normal, and so is a negative maximum if C is low enough.",
          ],
        },
      ],
      mistakes: [
        "Using A with its sign instead of its size, which swaps the maximum and the minimum.",
        "Forgetting the vertical shift and answering with just the amplitude.",
        "Letting the B inside the bracket into the calculation — it changes nothing here.",
      ],
      recap: [
        "Maximum = C + |A|, minimum = C − |A|.",
        "C is the middle of the wave; |A| is how far it reaches either side.",
        "Sine and cosine are capped at 1 and −1, which is where this comes from.",
        "B has no effect on the highest and lowest values.",
      ],
      practice: [
        { q: "Maximum value of y = 3sin(x) + 5", a: "8" },
        { q: "Minimum value of y = 6cos(x) − 2", a: "−8" },
        { q: "Maximum value of y = −4sin(x) + 7", a: "11" },
        { q: "Minimum value of y = 2cos(x) + 9", a: "7" },
        { q: "Maximum value of y = 8sin(x) − 3", a: "5" },
      ],
    },
  ],
};
