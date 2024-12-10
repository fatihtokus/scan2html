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

	// Create a core that writes to stdout
	core := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderCfg), // Console-friendly output
		zapcore.AddSync(zapcore.Lock(os.Stdout)),
		zapcore.DebugLevel, // Log level
	)

	// Create a logger
	logger := zap.New(core)
	defer logger.Sync() // Flushes buffer, if any

	// Use the Sugared logger for easier syntax
	Logger = logger.Sugar()
}
