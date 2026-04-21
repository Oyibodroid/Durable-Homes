'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useState } from 'react'

const billingSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().optional(),
  country: z.string().default('NG'),
  saveAddress: z.boolean().optional(),
})

type BillingFormData = z.infer<typeof billingSchema>

interface BillingFormProps {
  onSubmit: (data: BillingFormData) => void
  isSubmitting?: boolean
}

const countries = [
  { value: 'NG', label: 'Nigeria' },
  { value: 'US', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
]

const nigeriaStates = [
  'Lagos', 'Abuja', 'Rivers', 'Kano', 'Oyo', 'Kaduna', 'Delta', 'Edo'
]

export function BillingForm({ onSubmit, isSubmitting }: BillingFormProps) {
  const [selectedCountry, setSelectedCountry] = useState('NG')
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      country: 'NG',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name *
          </label>
          <Input
            id="firstName"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last Name *
          </label>
          <Input
            id="lastName"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address *
        </label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone Number *
        </label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Street Address *
        </label>
        <Input
          id="address"
          {...register('address')}
          error={errors.address?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            City *
          </label>
          <Input
            id="city"
            {...register('city')}
            error={errors.city?.message}
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State *
          </label>
          {selectedCountry === 'NG' ? (
            <Select
              onValueChange={(value) => setValue('state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {nigeriaStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="state"
              {...register('state')}
              error={errors.state?.message}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
            Postal Code
          </label>
          <Input
            id="postalCode"
            {...register('postalCode')}
            error={errors.postalCode?.message}
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            Country *
          </label>
          <Select
            defaultValue="NG"
            onValueChange={(value) => {
              setSelectedCountry(value)
              setValue('country', value)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="saveAddress"
          {...register('saveAddress')}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="saveAddress" className="ml-2 text-sm text-gray-600">
          Save this address for future orders
        </label>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={isSubmitting}
      >
        Continue to Payment
      </Button>
    </form>
  )
}