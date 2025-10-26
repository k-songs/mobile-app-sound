type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export const Logger = {
  log: (level: LogLevel, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'error':
        console.error(logMessage, data);
        break;
      case 'debug':
        console.debug(logMessage, data);
        break;
    }
  },

  gameStart: (mode: string, settings: any) => {
    Logger.log('info', `🎮 Training Mode Started`, {
      mode,
      questionCount: settings.questionCount,
      difficulty: settings.difficulty
    });
  },

  soundCatch: (result: 'Perfect' | 'Good' | 'Miss', details: any) => {
    Logger.log('info', `🔊 Sound Catch Result: ${result}`, details);
  },

  audioTest: (type: 'threshold' | 'balance', result: any) => {
    Logger.log('info', `🎧 Audio Test (${type}) Result`, result);
  },

  error: (context: string, error: Error) => {
    Logger.log('error', `❌ Error in ${context}`, {
      message: error.message,
      stack: error.stack
    });
  }
};
