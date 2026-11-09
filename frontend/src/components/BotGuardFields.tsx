type BotGuardFieldsProps = {
  formLoadedAt: number
}

export function BotGuardFields({ formLoadedAt }: BotGuardFieldsProps) {
  return (
    <div className="hp-field" aria-hidden="true">
      <label>
        Company website
        <input type="text" name="company_website" autoComplete="off" tabIndex={-1} defaultValue="" />
      </label>
      <input type="hidden" name="form_loaded_at" value={String(formLoadedAt)} />
    </div>
  )
}
