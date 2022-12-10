// Copyright 2022-present 650 Industries. All rights reserved.

import SDWebImage
import ExpoModulesCore

enum ImageCacheType: String, EnumArgument {
  case none
  case disk
  case memory
  case memoryAndDisk

  static func fromSdCacheType(_ sdImageCacheType: SDImageCacheType) -> ImageCacheType {
    switch sdImageCacheType {
    case .none:
      return .none
    case .disk:
      return .disk
    case .memory:
      return .memory
    case .all:
      return .memoryAndDisk
    }
  }

  func toSdCacheType() -> SDImageCacheType {
    switch self {
    case .none:
      return .none
    case .disk:
      return .disk
    case .memory:
      return .memory
    case .memoryAndDisk:
      return .all
    }
  }
}
