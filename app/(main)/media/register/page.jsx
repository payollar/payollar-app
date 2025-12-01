import MediaAgencyForm from "@/components/media-agency-form"
import { getHeaderImage } from "@/lib/getHeaderImage"

export default function MediaAgencyRegisterPage() {
  const headerImage = getHeaderImage("/media/register")
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header Cover */}
      <section className="relative h-48 md:h-64 w-full">
        <img
          src={headerImage}
          alt="Media Agency Registration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-3xl md:text-4xl font-bold">Media Agency Registration</h1>
            <p className="text-lg md:text-xl mt-2 opacity-90 max-w-2xl mx-auto">
              Join our platform and start receiving booking inquiries from clients
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <MediaAgencyForm />
      </section>
    </div>
  )
}

