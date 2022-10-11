import React from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../../components/AdminHeader'
import { useRouter } from 'next/router'

function Project() {

    const router = useRouter()
    const { pid } = router.query

    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>
            <AdminContentLayout>
                Project {pid}
            </AdminContentLayout>

        </div>
    )
}

export default Project