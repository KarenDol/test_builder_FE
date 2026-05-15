import Image from "next/image"

type BrandLogoProps = {
  /** Square logo: width and height in pixels (default 32). */
  size?: number
  /** Rectangular logo: override intrinsic width (use with height). */
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function BrandLogo({ size = 32, width, height, className, priority }: BrandLogoProps) {
  const w = width ?? size
  const h = height ?? size
  return (
    <Image
      src="/logo.png"
      alt="EduTest by Narxoz"
      width={w}
      height={h}
      className={className ?? "object-contain shrink-0"}
      priority={priority}
    />
  )
}
