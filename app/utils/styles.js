import grass from '../assets/grass.jpg'
export const s = {
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    leftPanel: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' },
    mainLayout: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' },
    heroContainer: { backgroundImage: `url(${grass})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100%' },
    heroLogo: { width: '30%', maxWidth: '100%', transform: 'translateY(-25px)' },
    gradientWhiteUp: {
        background: 'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,1))',
        margin: '0 !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        height: '190px'
    }
}
