export const action = async ({ request, params }) => { }
export default function PageComponent() {
    return (
        <div>
            <h1>this page has an iframe</h1>
            <iframe src="iframe" title="iframez" data-test-id="the-frame" style={{
                width: '90%',
                height: '70vh',
            }}
            />
        </div>
    )
}