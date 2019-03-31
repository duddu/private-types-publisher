import { config, createLogger, format, transports } from 'winston'

const { colorize, combine, label, metadata, printf } = format

const logFormatter = printf(({ level, message, label, metadata }) => {
    let out = `[shared-types-publisher] [@${label}] ${level}: ${message}`
    if (metadata) {
        out += Object.entries(metadata).reduce((list, [key, value]) => {
            return `${list} ${key}=${JSON.stringify(value)}`
        }, '')
    }
    return out
})

const transport = new transports.Console({
    handleExceptions: true
})

export const getLogger = (scope: string) =>
    createLogger({
        level: 'silly',
        levels: config.npm.levels,
        transports: transport,
        format: combine(metadata(), label({ label: scope }), colorize(), logFormatter)
    })
