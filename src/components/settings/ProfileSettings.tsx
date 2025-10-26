import React from 'react';
import { User, Briefcase, MapPin } from 'lucide-react';
import { Input } from '../ui/Input';
import type { User as UserType } from '../../services/auth/authContext';

interface ProfileSettingsProps {
  formData: Partial<UserType>;
  onInputChange: (field: string, value: string) => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">Informations Personnelles</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Prénom"
          value={formData.first_name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('first_name', e.target.value)}
          placeholder="Votre prénom"
        />

        <Input
          label="Nom"
          value={formData.last_name || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('last_name', e.target.value)}
          placeholder="Votre nom"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('email', e.target.value)}
          placeholder="votre@email.com"
          disabled
        />

        <Input
          label="Téléphone"
          value={formData.phone || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('phone', e.target.value)}
          placeholder="+33 6 12 34 56 78"
        />

        <Input
          label="Date de naissance"
          type="date"
          value={formData.date_of_birth || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('date_of_birth', e.target.value)}
        />

        <Input
          label="Nationalité"
          value={formData.nationality || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('nationality', e.target.value)}
          placeholder="Française"
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">Professionnel</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Profession"
          value={formData.profession || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('profession', e.target.value)}
          placeholder="Développeur, Chef de projet..."
        />

        <Input
          label="Entreprise"
          value={formData.company || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('company', e.target.value)}
          placeholder="Nom de votre entreprise"
        />

        <Input
          label="LinkedIn"
          value={formData.linkedin || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('linkedin', e.target.value)}
          placeholder="https://linkedin.com/in/votreprofil"
        />

        <Input
          label="Site web"
          value={formData.website || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('website', e.target.value)}
          placeholder="https://votresite.com"
        />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-800">Adresse</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Adresse"
          value={formData.address || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('address', e.target.value)}
          placeholder="123 rue de la République"
        />

        <Input
          label="Code postal"
          value={formData.postal_code || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('postal_code', e.target.value)}
          placeholder="75001"
        />

        <Input
          label="Ville"
          value={formData.city || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('city', e.target.value)}
          placeholder="Paris"
        />

        <Input
          label="Pays"
          value={formData.country || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('country', e.target.value)}
          placeholder="France"
        />
      </div>
    </div>
  );
};