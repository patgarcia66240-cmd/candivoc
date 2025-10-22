import React from 'react';

export const ConfigErrorSimple: React.FC = () => {
 
  

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-100  flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Image Section */}
        <div className="bg-gradient-to-br from-slate-100 to-gray-100 p-2 flex items-center justify-center">
          <img
            src="/images/candivoc.png"
            alt="Supabase Configuration"
            className="w-full h-auto rounded-lg  object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

   
       
      {/* Message Section */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Site en maintenance
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Nous revenons vers vous rapidement
          </p>
          <p className="text-sm text-gray-500">
            Merci de votre patience pendant nos améliorations
          </p>
        </div>

      </div>
      {/* End Content Section */}
    </div>
  );
};
