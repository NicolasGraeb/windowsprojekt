'use client';

import React, { useState } from 'react';
import { Participant } from '../models/Participant';
import { Input } from './Input';
import { Button } from './Button';

interface RegistrationFormProps {
  onSubmit: (participant: Participant) => void;
  onCancel: () => void;
}

export function RegistrationForm({ onSubmit, onCancel }: RegistrationFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    return /^[\d\s\+\-\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 9;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = 'Imię jest wymagane';
    if (!lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane';
    if (!email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Telefon jest wymagany';
    } else if (!validatePhone(phone)) {
      newErrors.phone = 'Nieprawidłowy format telefonu';
    }
    if (!organization.trim()) newErrors.organization = 'Organizacja jest wymagana';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const participant = new Participant(
      `p${Date.now()}`,
      firstName.trim(),
      lastName.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      organization.trim()
    );

    onSubmit(participant);
    
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setOrganization('');
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Imię"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
          required
        />
        <Input
          label="Nazwisko"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors.lastName}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <Input
        label="Telefon"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        placeholder="+48 123 456 789"
        required
      />

      <Input
        label="Organizacja"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
        error={errors.organization}
        required
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary">
          Zarejestruj
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}


