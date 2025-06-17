#pragma once

#include <iostream>
#include <opencv2/opencv.hpp>

#include "color.h"
#include "constants.h"
#include "device_enumerator.h"
#include "device_type.h"
#include "device.h"
#include "device_webcam.h"
#include "device_video.h"
#include "device_realsense.h"
#include "device_kinect.h"
#include "device_oakd.h"
#include "device_structure.h"
#include "floor_tracker.h"
#include "jpeg.h"
#include "intrinsics.h"
#include "vector_2d.h"
#include "vector_3d.h"

using namespace lightbuzz;

extern "C"
{
	EXPORT Device* lightbuzz_device_open(DeviceConfiguration configuration);
	EXPORT FrameData lightbuzz_device_update_all(Device* device);
	EXPORT void lightbuzz_device_close(Device* device);
	EXPORT bool lightbuzz_device_is_open(Device* device);
	EXPORT int lightbuzz_device_width(Device* device);
	EXPORT int lightbuzz_device_height(Device* device);
	EXPORT ColorFormat lightbuzz_device_color_format(Device* device);
	EXPORT int lightbuzz_device_imu_size(Device* device);
	EXPORT int lightbuzz_device_fps(Device* device);
	EXPORT Vector3D lightbuzz_device_map_2d_to_3d(Vector2D pixel, Intrinsics intrinsics, int width, int height, unsigned short* depth_data);
	EXPORT Vector2D lightbuzz_device_map_3d_to_2d(Vector3D point, Intrinsics intrinsics, int width, int height);
	EXPORT void lightbuzz_device_rotation(Device* device, float rotation[9]);
	EXPORT int lightbuzz_device_count(DeviceType type);
	EXPORT Intrinsics lightbuzz_device_intrinsics_color(Device* device);
	EXPORT Intrinsics lightbuzz_device_intrinsics_depth(Device* device);
	EXPORT void lightbuzz_device_alpha_beta_gamma(Device* device, float alpha, float beta, float gamma);

	EXPORT void lightbuzz_device_point_cloud(unsigned short* depth_data, unsigned char* color_data, int width, int height, int channels, Vector3D* vertices, Color* colors, int step, Intrinsics intrinsics, bool& valid);
	EXPORT void lightbuzz_device_estimate_floor(Vector3D* point_cloud_data, float* rotation_data, Vector3D acceleration, int step, int width, int height, Vector3D& floor_normal, lightbuzz::Vector3D& floor_origin);

	EXPORT unsigned char* lightbuzz_encode_color(unsigned char* raw_data, int width, int height, int channels, int quality, int& output_size);
	EXPORT unsigned char* lightbuzz_decode_color(unsigned char* compressed_data, int channels, int input_size, int& output_size);
	EXPORT void lightbuzz_array_release(unsigned char* array);
    EXPORT void lightbuzz_array_release_float(float* array);
}

