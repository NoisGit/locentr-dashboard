import { useState } from 'react'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

const HelpReplyForm = ({ onSubmit }: { onSubmit: (msg: string) => void }) => {
    const [value, setValue] = useState('')

    const handleSubmit = () => {
        if (value.trim()) {
            onSubmit(value)
            setValue('')
        }
    }

    return (
        <div>
            <h4 className="mb-2 text-base font-semibold">Respond to Ticket</h4>
            <Textarea
                className="w-full"
                rows={4}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Write your response here..."
            />
            <div className="mt-3 text-right">
                <Button size="sm" variant="solid" onClick={handleSubmit}>
                    Send Response
                </Button>
            </div>
        </div>
    )
}

export default HelpReplyForm
