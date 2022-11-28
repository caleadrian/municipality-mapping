import React, { useState, useEffect } from 'react'

const Pagination = ({ projects, total, offset, showing, onPageChange }) => {

    const [showingCount, setShowingCount] = useState()

    useEffect(() => {
        if (!showingCount)
            setShowingCount(showing)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showing, showingCount])


    // useEffect(() => {
    //     console.log('useeff', showingCount)

    // }, [showingCount])

    const [currPage, setCurrPage] = useState(1)
    const pages = (total / offset) > parseInt(total / offset) ? parseInt(total / offset) + 1 : (total / offset)

    const handleNext = () => {
        if (currPage < pages) {
            setCurrPage(prev => prev + 1)

            const foo = projects
            const bar = foo.slice(showingCount, showingCount + offset)

            // const x = showingCount + offset
            setShowingCount(prev => prev + offset)
            onPageChange(bar)
        }
    }

    const handlePrev = () => {
        if (currPage > 1) {
            setCurrPage(prev => prev - 1)

            const foo = projects
            const bar = foo.slice(showingCount - (offset * 2), showingCount - offset)
            // console.log('prev', showingCount - (offset * 2), showingCount - offset)
            setShowingCount(prev => prev - offset)
            onPageChange(bar)
        }
    }


    return (
        <div className='flex justify-between py-3 px-5 items-center'>
            <div className='text-sm'>
                {`Showing ${showing} of ${total} projects`}
            </div>
            <div>
                {`Page ${currPage} of ${pages}`}
            </div>
            <div>
                <button
                    disabled={currPage === 1}
                    onClick={() => handlePrev()}
                    className='border disabled:bg-gray-200 hover:bg-gray-50 bg-white font-medium text-sm rounded-md px-4 py-1.5 mr-2'>
                    Previous
                </button>

                <button
                    disabled={currPage === pages}
                    onClick={() => handleNext()}
                    className='border disabled:bg-gray-200 hover:bg-gray-50 bg-white font-medium text-sm rounded-md px-4 py-1.5'>
                    Next
                </button>
            </div>
        </div>
    )
}

export default Pagination