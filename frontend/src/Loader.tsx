import loader from './images/loading.svg'

export default function Loader(loading: boolean) {
    return (
        <>{!loading && <img src={loader} className="h-24" alt="loading" />}</>
    )
}