import { PageHeader } from "@/components/shared/page-header"
import { SupplierForm } from "@/components/suppliers/supplier-form"

export default function NewSupplierPage() {
  return (
    <>
      <PageHeader title="New Supplier" />
      <SupplierForm />
    </>
  )
}
