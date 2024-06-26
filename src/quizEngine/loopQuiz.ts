import { IQuizOptions, IQuiz, TOptionsReturnType } from "../quiz/quiztypes/quiz-types";
import { Log } from "../logger/logSync";
import { LogAsync } from "../logger/logAsync";
import { FatalError, customExit } from "../utils";

export async function loopQuiz(QuizClass: IQuiz<IQuizOptions[]>, cliOptions : Record<string, string[]> | undefined) {

  var options: TOptionsReturnType<IQuizOptions[]> = [];
  const allOptions = QuizClass.meta().all_options;

  if (!allOptions.is_empty()) {
    for (const optionType of allOptions) {
      try {
        let selectOptions
        if (cliOptions) {
          selectOptions = optionType.cliShort in cliOptions ? cliOptions[optionType.cliShort] : optionType.options(options)
        } else {
          if ("isCli" in optionType) {
            selectOptions = optionType.options(options)
          } else {
            selectOptions = await LogAsync.checkboxes(
              optionType.options(options),
              `Please select: ${optionType.name} or quit(q)`,
              "q"
            );
          }
          
        }
        options.push({ name : optionType.name, options: selectOptions })
      } catch (err) {
        return;
      }
    }
  }

  while (true) {
    let quiz
    try {
      quiz = new QuizClass(options);
    } catch(error) {
      throw new FatalError((error as Error).message)
    }
    
    Log.clear();
    Log.write(QuizClass.meta().description);

    for (const head of quiz.quiz_head) {
      Log.write(head);
    }

    try {
      const choice = await quiz.execute();
      Log.write(quiz.feedback(choice));
    } catch (err) {
      await quiz.cleanup();
      break;
    }

    try {
      await LogAsync.questions_in_list(
        ["Continue"],
        "Continue or Quit",
        "q"
      );
    } catch (err) {
      break;
    } finally {
      await quiz.cleanup();
    }
  }
}
