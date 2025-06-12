import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-muted p-6 md:py-12 w-full">
      <div className="container max-w-7xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm">
        <div className="grid gap-1">
          <h3 className="font-semibold">Japan Seiji</h3>
          <Link href="#" prefetch={false}>
            About Us
          </Link>
          <Link href="#" prefetch={false}>
            Our Mission
          </Link>
          <Link href="#" prefetch={false}>
            Contact
          </Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Platform</h3>
          <Link href="/explorer" prefetch={false}>
            Data Explorer
          </Link>
          <Link href="/developer/api-docs" prefetch={false}>
            API Docs
          </Link>
          <Link href="#" prefetch={false}>
            Integrations
          </Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Resources</h3>
          <Link href="/docs" prefetch={false}>
            Documentation
          </Link>
          <Link href="#" prefetch={false}>
            Blog
          </Link>
          <Link href="#" prefetch={false}>
            Community
          </Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Legal</h3>
          <Link href="/terms" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="/privacy" prefetch={false}>
            Privacy Policy
          </Link>
        </div>
        <div className="grid gap-1">
          <h3 className="font-semibold">Connect</h3>
          <Link href="#" prefetch={false}>
            Twitter
          </Link>
          <Link href="#" prefetch={false}>
            LinkedIn
          </Link>
          <Link href="#" prefetch={false}>
            GitHub
          </Link>
        </div>
      </div>
      <div className="container max-w-7xl mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Japan Seiji. All rights reserved.
        <p className="mt-1">
          Disclaimer: This platform provides publicly available data for informational purposes only. It is not intended
          for financial, legal, or investment advice.
        </p>
      </div>
    </footer>
  )
}
