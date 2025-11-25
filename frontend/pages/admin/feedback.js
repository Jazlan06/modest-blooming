import FeedbackManagement from '@/components/admin/FeedbackManagement';
import Navbar from '@/components/Navbar';
import withAdminAuth from '@/utils/withAdminAuth';

function AdminFeedbackPage() {
    return (
        <>
            <Navbar />
            <FeedbackManagement />
        </>
    )
}
export default withAdminAuth(AdminFeedbackPage);