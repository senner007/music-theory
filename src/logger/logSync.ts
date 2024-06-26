import chalk from "chalk";
import { isDev } from "../dev-utils";
import rs from "readline-sync";

export interface IGlobalHook {
  value: string;
  key: string;
}

export class Log {
    static clear() {
      if (!isDev()) {
        console.clear();
      }
    }
    static write(content: string) {
      console.log(content);
    }

    static devLog(content: any) {
      if (!isDev()) return;
      Log.write(chalk.yellow(content));
    }
  
    static success(content: string) {
      this.write(chalk.green(content));
    }
  
    static error(content: string) {
      this.write(chalk.red(content));
    }

    static stack(content: string) {
      this.write(chalk.yellow(content));
    }

    static keyHooks(
      globalHook: IGlobalHook[]
    ): void
   {
    const hooks = chalk.bgWhite.gray(globalHook.map((hook) => `Press ${hook.key} to ${hook.value}`).join("\n"));
    Log.write(hooks)
   }
    static keyInSelect(questionOptions: string[], question: string) {
      return rs.keyInSelect(
        questionOptions,
        question,
        { cancel: false }
      );
    }
  
    static continue(message: string) {
      return rs.question(message, { hideEchoBack: true, mask: "" });
    }
  }