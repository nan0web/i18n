/**
 * Bash/Zsh completion script for i18n CLI
 */
export const completionScript = `
_i18n_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    opts="audit sync generate completion"

    case "\$prev" in
        generate)
            COMPREPLY=( $(compgen -W "--data --out" -- "\$cur") )
            return 0
            ;;
        completion)
            COMPREPLY=( $(compgen -W "bash zsh" -- "\$cur") )
            return 0
            ;;
    esac

    if [[ "\$cur" == -* ]]; then
        COMPREPLY=( $(compgen -W "--data --out" -- "\$cur") )
        return 0
    fi

    COMPREPLY=( $(compgen -W "\$opts" -- "\$cur") )
}
complete -F _i18n_completion i18n
`

export const zshCompletionScript = `
#compdef i18n
_i18n() {
    local line
    _arguments -C \\
        "1: :((audit:'Audit i18n keys' \\
               sync:'Sync translations' \\
               generate:'Generate JS cache from YAML' \\
               completion:'Generate shell completion script'))" \\
        "*::arg:->args"

    case "\$line[1]" in
        generate)
            _arguments \\
                "--data[Data directory (default: ./data)]" \\
                "--out[Output directory (default: ./src/i18n)]"
            ;;
        completion)
            _arguments "1:shell:(bash zsh)"
            ;;
    esac
}
compdef _i18n i18n
`
