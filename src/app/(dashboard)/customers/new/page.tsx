import { PageHeader } from "@/components/shared/page-header"
import { CustomerForm } from "@/components/customers/customer-form"

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader title="New Customer" />
      <CustomerForm />
    </>
  )
}
