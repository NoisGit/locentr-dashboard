import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import GrowShrinkValue from '@/components/shared/GrowShrinkValue'
import classNames from '@/utils/classNames'
import { useNavigate } from 'react-router-dom'
import type { Product } from '../types'

type TopProductProps = {
  data?: Product[] | null
}

const TopProduct = ({ data }: TopProductProps) => {
  const navigate = useNavigate()

  const handleViewAll = () => {
    navigate('/concepts/products/product-list')
  }

  const products = (Array.isArray(data) ? data : []).filter(
    (product) => product?.name !== 'Il Limone',
  )

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h4>Últimos Ingresos</h4>
        <Button size="sm" onClick={handleViewAll}>
          View all
        </Button>
      </div>

      <div className="mt-5">
        {products.length === 0 ? (
          <div className="text-center text-sm opacity-60 py-10">
            No hay datos disponibles.
          </div>
        ) : (
          products.map((product, index, arr) => (
            <div
              key={String(product.id ?? index)}
              className={classNames(
                'flex items-center justify-between py-2 dark:border-gray-600',
                index !== arr.length - 1 && 'mb-2',
              )}
            >
              <div className="flex items-center gap-2">
                <Avatar
                  className="bg-white"
                  size={50}
                  src={product.img ?? ''}
                  shape="round"
                />
                <div>
                  <div className="heading-text font-bold">
                    {product.name ?? '—'}
                  </div>
                  <div>Sold: {product.sales ?? 0}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <GrowShrinkValue
                  className="rounded-lg py-0.5 px-2 font-bold"
                  value={Number(product.growShrink ?? 0)}
                  positiveClass="bg-success-subtle"
                  negativeClass="bg-error-subtle"
                  suffix="%"
                  positiveIcon="+"
                  negativeIcon=""
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

export default TopProduct
