import { HEADER_HEIGHT } from '@/constants/theme.constant'

const useLayoutGap = () => {
    const getTopGapValue = () => HEADER_HEIGHT + 24

    return {
        getTopGapValue,
    }
}

export default useLayoutGap
