using System.Reflection;
using System.Text.RegularExpressions;
using EventTracker.attributes;
using EventTracker.exceptions;

namespace EventTracker.utils;

public static class ReflectionMapper
{
    public static TTarget Map<TSource, TTarget>(TSource source) where TTarget : new()
    {
        var target = new TTarget();
        var sourceType = typeof(TSource);
        var targetType = typeof(TTarget);

        var sourceProperties = sourceType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var targetProperties = targetType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var sourceProp in sourceProperties)
        {
            var targetProp = targetProperties.FirstOrDefault(p => p.Name == sourceProp.Name && p.PropertyType == sourceProp.PropertyType);
            if (targetProp != null && targetProp.CanWrite)
            {
                var value = sourceProp.GetValue(source);
                targetProp.SetValue(target, value);
            }
        }

        return target;
    }

    public static void ValidateObject<T>(T obj)
    {
        var type = typeof(T);
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var prop in properties)
        {
            var validateAttr = prop.GetCustomAttribute<ValidateAttribute>();
            if (validateAttr == null)
                continue;

            var value = prop.GetValue(obj);
            var valueString = value?.ToString() ?? string.Empty;

            if (validateAttr.Required && (value == null || string.IsNullOrWhiteSpace(valueString)))
            {
                throw new InvalidRegistrationException($"Pole {prop.Name} jest wymagane");
            }

            if (!string.IsNullOrEmpty(valueString))
            {
                if (validateAttr.MinLength > 0 && valueString.Length < validateAttr.MinLength)
                {
                    throw new InvalidRegistrationException(
                        $"Pole {prop.Name} musi mieć co najmniej {validateAttr.MinLength} znaków");
                }

                if (validateAttr.MaxLength > 0 && valueString.Length > validateAttr.MaxLength)
                {
                    throw new InvalidRegistrationException(
                        $"Pole {prop.Name} może mieć maksymalnie {validateAttr.MaxLength} znaków");
                }

                if (!string.IsNullOrEmpty(validateAttr.Pattern))
                {
                    if (!Regex.IsMatch(valueString, validateAttr.Pattern))
                    {
                        throw new InvalidRegistrationException(
                            $"Pole {prop.Name} ma nieprawidłowy format");
                    }
                }
            }
        }
    }

    public static Dictionary<string, object?> GetSerializableProperties<T>(T obj)
    {
        var result = new Dictionary<string, object?>();
        var type = typeof(T);
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var prop in properties)
        {
            var loggableAttr = prop.GetCustomAttribute<attributes.LoggableAttribute>();
            if (loggableAttr != null && loggableAttr.IncludeInLog)
            {
                var value = prop.GetValue(obj);
                var key = loggableAttr.LogName ?? prop.Name;
                result[key] = value;
            }
        }

        return result;
    }
}
