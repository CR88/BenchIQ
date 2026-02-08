import { PageHeader } from "@/components/shared/page-header"
import { InventoryForm } from "@/components/inventory/inventory-form"

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Add Product" />
      <InventoryForm />
    </>
  )
}
