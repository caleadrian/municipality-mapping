import React from 'react'
import AdminHeader, { LayoutStyle, AdminContentLayout } from '../../../components/AdminHeader'

function Feedbacks() {
    return (
        <div className={LayoutStyle}>
            <AdminHeader></AdminHeader>

            <AdminContentLayout>
                feedbacks
            </AdminContentLayout>
        </div>
    )
}

export default Feedbacks