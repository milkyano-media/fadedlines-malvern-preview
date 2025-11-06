import React, {
    PropsWithChildren,
    useCallback,
    useEffect,
    useState
} from 'react'
import { EmblaCarouselType } from 'embla-carousel'

type UsePrevNextButtonsType = {
    prevBtnDisabled: boolean
    nextBtnDisabled: boolean
    onPrevButtonClick: () => void
    onNextButtonClick: () => void
}
import styles from '@/styles/CarauselGallery.module.css';

// eslint-disable-next-line react-refresh/only-export-components
export const usePrevNextButtons = (
    emblaApi: EmblaCarouselType | undefined,
    onButtonClick?: (emblaApi: EmblaCarouselType) => void
): UsePrevNextButtonsType => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

    const onPrevButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollPrev()
        if (onButtonClick) onButtonClick(emblaApi)
    }, [emblaApi, onButtonClick])

    const onNextButtonClick = useCallback(() => {
        if (!emblaApi) return
        emblaApi.scrollNext()
        if (onButtonClick) onButtonClick(emblaApi)
    }, [emblaApi, onButtonClick])

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setPrevBtnDisabled(!emblaApi.canScrollPrev())
        setNextBtnDisabled(!emblaApi.canScrollNext())
    }, [])

    useEffect(() => {
        if (!emblaApi) return

        onSelect(emblaApi)
        emblaApi.on('reInit', onSelect)
        emblaApi.on('select', onSelect)
    }, [emblaApi, onSelect])

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        onPrevButtonClick,
        onNextButtonClick
    }
}

type PropType = PropsWithChildren<
    React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
>


export const PrevButton = React.forwardRef<HTMLButtonElement, PropType>((props, ref) => {
    const { children, ...restProps } = props

    return (
        <button
            ref={ref}
            aria-label='Previous'
            className={`${styles.embla__button} ${styles.embla__button__prev}`}
            type="button"
            {...restProps}
        >
            <svg width="78" height="78" viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.embla__button__svg} >
                <g filter="url(#filter0_d_566_432)">
                    <circle cx="39" cy="35" r="24" fill="white" />
                </g>
                <path d="M55 37C56.1046 37 57 36.1046 57 35C57 33.8954 56.1046 33 55 33L55 37ZM21.5858 33.5858C20.8047 34.3668 20.8047 35.6332 21.5858 36.4142L34.3137 49.1421C35.0948 49.9232 36.3611 49.9232 37.1421 49.1421C37.9232 48.3611 37.9232 47.0948 37.1421 46.3137L25.8284 35L37.1421 23.6863C37.9232 22.9052 37.9232 21.6389 37.1421 20.8579C36.3611 20.0768 35.0948 20.0768 34.3137 20.8579L21.5858 33.5858ZM55 33L23 33L23 37L55 37L55 33Z" fill="url(#paint0_linear_566_432)" />
                <defs>
                    <filter id="filter0_d_566_432" x="0" y="0" width="78" height="78" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="4" />
                        <feGaussianBlur stdDeviation="7.5" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_566_432" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_566_432" result="shape" />
                    </filter>
                    <linearGradient id="paint0_linear_566_432" x1="23" y1="34.5" x2="55" y2="34.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#00FF0A" />
                        <stop offset="1" stop-color="#16A613" />
                    </linearGradient>
                </defs>
            </svg>

            {children}
        </button>
    )
})

PrevButton.displayName = 'PrevButton';

export const NextButton = React.forwardRef<HTMLButtonElement, PropType>((props, ref) => {
    const { children, ...restProps } = props
    return (
        <button
            ref={ref}
            aria-label='Next'
            className={`${styles.embla__button} ${styles.embla__button__next}`}
            type="button"
            {...restProps}
        >
            <svg width="78" height="78" viewBox="0 0 78 78" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.embla__button__svg}>
                <g filter="url(#filter0_d_566_433)">
                    <circle cx="39" cy="35" r="24" fill="white" />
                </g>
                <path d="M23 33C21.8954 33 21 33.8954 21 35C21 36.1046 21.8954 37 23 37V33ZM56.4142 36.4142C57.1953 35.6332 57.1953 34.3668 56.4142 33.5858L43.6863 20.8579C42.9052 20.0768 41.6389 20.0768 40.8579 20.8579C40.0768 21.6389 40.0768 22.9052 40.8579 23.6863L52.1716 35L40.8579 46.3137C40.0768 47.0948 40.0768 48.3611 40.8579 49.1421C41.6389 49.9232 42.9052 49.9232 43.6863 49.1421L56.4142 36.4142ZM23 37L55 37V33L23 33V37Z" fill="url(#paint0_linear_566_433)" />
                <defs>
                    <filter id="filter0_d_566_433" x="0" y="0" width="78" height="78" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <feOffset dy="4" />
                        <feGaussianBlur stdDeviation="7.5" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_566_433" />
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_566_433" result="shape" />
                    </filter>
                    <linearGradient id="paint0_linear_566_433" x1="55" y1="35.5" x2="23" y2="35.5" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#00FF0A" />
                        <stop offset="1" stop-color="#16A613" />
                    </linearGradient>
                </defs>
            </svg>
            {children}
        </button>
    )
})

NextButton.displayName = 'NextButton';