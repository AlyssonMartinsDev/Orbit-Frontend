import "./Loading.css";

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

export function Loading({
    message = "Carregando...",
    fullScreen = true,
}: LoadingProps) {
    return (
        <div
            className={
                fullScreen
                    ? "loading loading--fullscreen"
                    : "loading"
            }
        >
            <div className="loading__spinner"></div>

            <span className="loading__text">
                {message}
            </span>
        </div>
    );
}