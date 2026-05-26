import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

type NotificationsBroadcastFormProps = {
    canSend: boolean
    isSubmitting: boolean
    message: string
    title: string
    setMessage: (value: string) => void
    setTitle: (value: string) => void
    onSubmit: () => void
}

const NotificationsBroadcastForm = ({
    canSend,
    isSubmitting,
    message,
    title,
    setMessage,
    setTitle,
    onSubmit,
}: NotificationsBroadcastFormProps) => {
    return (
        <Card>
            <div className="flex flex-col gap-4">
                <div>
                    <h5>Broadcast notification</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Send a Coredeck notification to every user.
                    </p>
                </div>

                {!canSend ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                        Your role can review unread notifications, but cannot send broadcasts.
                    </div>
                ) : null}

                {canSend ? (
                    <>
                        <Input
                            placeholder="Notification title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                        <Textarea
                            placeholder="Notification message"
                            rows={4}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                        />
                        <div>
                            <Button
                                loading={isSubmitting}
                                variant="solid"
                                onClick={onSubmit}
                            >
                                Send to all users
                            </Button>
                        </div>
                    </>
                ) : null}
            </div>
        </Card>
    )
}

export default NotificationsBroadcastForm
