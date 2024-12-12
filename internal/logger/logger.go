package logger

import (
	"os"
	"runtime"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Logger *zap.SugaredLogger

func init() {
	encoderLevel := zapcore.CapitalColorLevelEncoder
	// when running on Windows, don't log with color
	if runtime.GOOS == "windows" {
		encoderLevel = zapcore.CapitalLevelEncoder
	}

	encoderCfg := zapcore.EncoderConfig{
		TimeKey:        "Time",
		LevelKey:       "Level",
		NameKey:        "Name",
		CallerKey:      "Caller",
		MessageKey:     "Msg",
		StacktraceKey:  "St",
		EncodeLevel:    encoderLevel,
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		EncodeDuration: zapcore.StringDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	// Core for stdout (Info and below)
	stdoutCore := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCfg),
		zapcore.AddSync(zapcore.Lock(os.Stdout)),
		zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
			return lvl < zapcore.ErrorLevel
		}),
	)

	// Core for stderr (Error and above)
	stderrCore := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCfg),
		zapcore.AddSync(zapcore.Lock(os.Stderr)),
		zap.LevelEnablerFunc(func(lvl zapcore.Level) bool {
			return lvl >= zapcore.ErrorLevel
		}),
	)

	// Combine both cores
	combinedCore := zapcore.NewTee(stdoutCore, stderrCore)

	// Create a logger
	logger := zap.New(combinedCore)
	defer logger.Sync()

	// Use the Sugared logger for easier syntax
	Logger = logger.Sugar()
}
