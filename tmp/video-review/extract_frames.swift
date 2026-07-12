import AVFoundation
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

let source = URL(fileURLWithPath: CommandLine.arguments[1])
let destination = URL(fileURLWithPath: CommandLine.arguments[2])
let asset = AVURLAsset(url: source)
let duration = try await asset.load(.duration)
let seconds = CMTimeGetSeconds(duration)
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.maximumSize = CGSize(width: 540, height: 960)

for fraction in [0.12, 0.35, 0.58, 0.78] {
  let time = CMTime(seconds: seconds * fraction, preferredTimescale: 600)
  let image = try generator.copyCGImage(at: time, actualTime: nil)
  let output = destination.appendingPathComponent("frame-\(Int(fraction * 100)).jpg")
  guard let writer = CGImageDestinationCreateWithURL(output as CFURL, UTType.jpeg.identifier as CFString, 1, nil) else { continue }
  CGImageDestinationAddImage(writer, image, [kCGImageDestinationLossyCompressionQuality: 0.9] as CFDictionary)
  CGImageDestinationFinalize(writer)
}
