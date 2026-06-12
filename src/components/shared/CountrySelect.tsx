import Select from '@/components/ui/Select'

type CountryOption = {
    value: string
    label: string
    code: string
}

type CountrySelectProps = {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
}

const countries: Array<[string, string]> = [
    ['AR', 'Argentina'],
    ['BO', 'Bolivia'],
    ['BR', 'Brasil'],
    ['CA', 'Canadá'],
    ['CL', 'Chile'],
    ['CO', 'Colombia'],
    ['CR', 'Costa Rica'],
    ['CU', 'Cuba'],
    ['DO', 'República Dominicana'],
    ['EC', 'Ecuador'],
    ['SV', 'El Salvador'],
    ['US', 'Estados Unidos'],
    ['GT', 'Guatemala'],
    ['HT', 'Haití'],
    ['HN', 'Honduras'],
    ['JM', 'Jamaica'],
    ['MX', 'México'],
    ['NI', 'Nicaragua'],
    ['PA', 'Panamá'],
    ['PY', 'Paraguay'],
    ['PE', 'Perú'],
    ['PR', 'Puerto Rico'],
    ['UY', 'Uruguay'],
    ['VE', 'Venezuela'],
    ['DE', 'Alemania'],
    ['AU', 'Australia'],
    ['AT', 'Austria'],
    ['BE', 'Bélgica'],
    ['CN', 'China'],
    ['KR', 'Corea del Sur'],
    ['DK', 'Dinamarca'],
    ['AE', 'Emiratos Árabes Unidos'],
    ['ES', 'España'],
    ['FI', 'Finlandia'],
    ['FR', 'Francia'],
    ['GR', 'Grecia'],
    ['IN', 'India'],
    ['IE', 'Irlanda'],
    ['IL', 'Israel'],
    ['IT', 'Italia'],
    ['JP', 'Japón'],
    ['MA', 'Marruecos'],
    ['NO', 'Noruega'],
    ['NZ', 'Nueva Zelanda'],
    ['NL', 'Países Bajos'],
    ['PL', 'Polonia'],
    ['PT', 'Portugal'],
    ['GB', 'Reino Unido'],
    ['SG', 'Singapur'],
    ['ZA', 'Sudáfrica'],
    ['SE', 'Suecia'],
    ['CH', 'Suiza'],
]

function countryFlag(code: string) {
    return String.fromCodePoint(
        ...code
            .toUpperCase()
            .split('')
            .map((character) => 127397 + character.charCodeAt(0)),
    )
}

const countryOptions: CountryOption[] = countries.map(([code, name]) => ({
    code,
    value: name,
    label: `${countryFlag(code)}  ${name}`,
}))

const CountrySelect = ({
    value,
    onChange,
    placeholder = 'Selecciona un país',
}: CountrySelectProps) => {
    const selected =
        countryOptions.find((option) => option.value === value) ?? null

    return (
        <Select<CountryOption>
            isClearable
            options={countryOptions}
            placeholder={placeholder}
            value={selected}
            onChange={(option) => onChange(option?.value ?? '')}
        />
    )
}

export default CountrySelect
